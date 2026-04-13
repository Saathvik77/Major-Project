const Task = require("../models/Task");
const User = require("../models/User");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const user = await User.findById(userId);
    const msg = message.toLowerCase().trim();
    const executedActions = [];
    let reply = "";

    // ─── HELPER: EXTRACT TIME ──────────────────────────────────────────
    const extractTime = (str) => {
      const timeMatch = str.match(/(?:at|for|by|to|from)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi);
      if (!timeMatch || timeMatch.length < 1) return { time: "09:00", text: str };
      
      const parseSingle = (tMatch) => {
        let tStr = tMatch.replace(/at|for|by|to|from|\s/gi, '').toLowerCase();
        let [rawHrs, mins] = tStr.replace(/am|pm/g, '').split(':');
        let hours = parseInt(rawHrs);
        mins = mins || "00";
        if (tStr.includes("pm") && hours < 12) hours += 12;
        if (tStr.includes("am") && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${mins.padStart(2, '0')}`;
      };

      const startTime = parseSingle(timeMatch[0]);
      const endTime = timeMatch[1] ? parseSingle(timeMatch[1]) : "17:00";
      
      const remainingText = str.replace(timeMatch[0], "").replace(timeMatch[1] || "", "").trim();
      return { startTime, endTime, text: remainingText };
    };

    // ─── 0. CONTEXTUAL FLOW HANDLING ─────────────────────────────────────────
    if (user.aiContext?.flow) {
      if (msg === "cancel" || msg === "exit" || msg === "stop") {
        user.aiContext = { flow: null, step: 0, data: {} };
        await user.save();
        return res.json({ reply: "Flow terminated. System returning to standby mode.", actions: [] });
      }

      let context = user.aiContext;

      // STEP 1: CAPTURE SUBJECTS
      if (context.step === 1) {
        const subjects = message.split(/[,;|]|\band\b/).map(s => s.trim()).filter(s => s.length > 0);
        if (subjects.length === 0) {
          reply = "I couldn't identify any subjects. Please list the topics you want to cover (e.g., Algebra, Geometry, Physics).";
        } else {
          context.data.subjects = subjects;
          context.step = 2;
          user.markModified('aiContext');
          await user.save();
          reply = `Acknowledged. I've noted: ${subjects.join(", ")}.\n\nFinal step: What are your preferred daily timings for this ${context.data.days}-day roadmap? (e.g., 9am to 5pm)`;
        }
      } 
      // STEP 2: CAPTURE TIMINGS & FINALIZE (With Smart Distribution)
      else if (context.step === 2) {
        const { startTime, endTime } = extractTime(msg);
        const { subjects, days, topic } = context.data;
        const totalDays = parseInt(days);
        
        // Distribution Logic: Split subjects over days
        const subjectsPerDay = Math.ceil(subjects.length / totalDays);
        const startDate = new Date();
        const createdTasks = [];

        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i + 1); 
          const dateStr = currentDate.toISOString().split('T')[0];

          // Get subjects for THIS specific day
          const daySubjects = subjects.slice(i * subjectsPerDay, (i + 1) * subjectsPerDay);

          daySubjects.forEach((subject, idx) => {
            const task = new Task({
              user: userId,
              title: `${topic}: ${subject}`,
              description: `Automated study block for day ${i+1}. Part of your ${totalDays}-day ${topic} protocol.`,
              date: dateStr,
              startTime: startTime,
              endTime: endTime,
              category: "Learning",
              priority: "High"
            });
            createdTasks.push(task);
            executedActions.push({ type: "task_created", title: task.title });
          });
        }

        await Task.insertMany(createdTasks);
        
        user.aiContext = { flow: null, step: 0, data: {} };
        await user.save();

        reply = `Success! I've orchestrated your ${totalDays}-day ${topic} roadmap by dividing ${subjects.length} topics across ${totalDays} days. ${createdTasks.length} sessions synchronized. \n\nDaily window: ${startTime} to ${endTime}. Godspeed! 🚀`;
      }

      return res.json({ reply, actions: executedActions });
    }

    // ─── 1. NEW FLOW INITIATION (TOP PRIORITY) ────────────────────────────────
    if (msg.includes("prepare") && (msg.includes("schedule") || msg.includes("roadmap") || msg.includes("plan"))) {
      const dayMatch = msg.match(/(\d+)\s*day/i);
      const days = dayMatch ? dayMatch[1] : "5";
      const topic = msg.replace(/prepare|schedule|roadmap|plan|\d+\s*day|for/gi, "").trim() || "Deep Learning";

      user.aiContext = {
        flow: "scheduling",
        step: 1,
        data: { topic, days }
      };
      user.markModified('aiContext');
      await user.save();

      reply = `I've initiated the **Architect Protocol** for your ${days}-day "${topic}" roadmap. 🏗️\n\nTo optimize your nodes, please provide the subjects or modules you wish to cover (e.g., Math, Science, History).`;
      return res.json({ reply, actions: [] });
    }

    // ─── 2. EXISTING INTENTS (LOWER PRIORITY) ──────────────────────────────────
    if (msg.includes("plan my day") || msg.includes("analyze my load") || (msg.includes("plan") && msg.includes("day"))) {
       const todayDate = new Date();
       todayDate.setHours(0, 0, 0, 0);
       const todayStr = todayDate.toISOString().split('T')[0];

       // 1. Recover Overdue Tasks: Find incomplete tasks from the past and move them to Today
       const overdueTasks = await Task.find({ 
         user: userId, 
         completed: false, 
         date: { $lt: todayStr } 
       });

       if (overdueTasks.length > 0) {
         await Task.updateMany(
           { _id: { $in: overdueTasks.map(t => t._id) } },
           { $set: { date: todayStr } }
         );
       }

       // 2. Fetch today's consolidated plan
       const tasks = await Task.find({ user: userId, date: todayStr });
       const completed = tasks.filter(t => t.completed);
       const currentTimeStr = new Date().toTimeString().split(' ')[0];
       const missed = tasks.filter(t => !t.completed && t.endTime < currentTimeStr);
       const pending = tasks.filter(t => !t.completed && t.endTime >= currentTimeStr);

       executedActions.push({
         type: "categorized_schedule",
         recoveredCount: overdueTasks.length,
         completed,
         missed,
         pending
       });

       if (overdueTasks.length > 0) {
         reply = `System analysis complete. I've recovered **${overdueTasks.length} missed objectives** from your past cycles and integrated them into today's operational flow. Total targets today: ${tasks.length}. Optimize your focus accordingly.`;
       } else {
         reply = `Operational load analyzed. Your current schedule is synchronized. Total targets today: ${tasks.length}. Review your milestones above.`;
       }
    }
    else if ((msg.includes("report") || msg.includes("analyze") || msg.includes("review")) && (msg.includes("productivity") || msg.includes("health") || msg.includes("performance"))) {
       const allTasks = await Task.find({ user: userId });
       const completed = allTasks.filter(t => t.completed);
       const missed = allTasks.filter(t => !t.completed && (t.isOverdue || (t.endTime && t.endTime < new Date().toTimeString().split(' ')[0])));
       const rescheduled = allTasks.filter(t => t.rescheduledCount > 0);

        const total = completed.length + missed.length;
        const efficiency = total > 0 ? Math.round((completed.length / total) * 100) : 100;
        
        // Dynamic suggestions based on data
        const suggestions = [];
        if (missed.length > 0) suggestions.push("Prioritize rescheduling your overdue objectives to early morning slots to recapture momentum.");
        if (efficiency < 70) suggestions.push("I detect a dip in operational efficiency. Try the Pomodoro Technique (25/5) to rebuild focus.");
        if (rescheduled.length >= 2) suggestions.push("Multiple re-optimizations detected. Consider padding your time estimates by 15% for complex tasks.");
        if (completed.length > 3 && efficiency > 80) suggestions.push("Exceptional flow detected! This is the ideal window for your highest-priority objective.");
        
        const recommendation = suggestions.length > 0 ? suggestions[Math.floor(Math.random() * suggestions.length)] : "System status stable. Maintain current operational protocols for peak performance.";

        executedActions.push({
          type: "comprehensive_report",
          completed: completed.map(t => ({ title: t.title, date: t.date })),
          missed: missed.map(t => ({ title: t.title, date: t.date })),
          rescheduled: rescheduled.map(t => ({ title: t.title, date: t.date, count: t.rescheduledCount })),
          suggestion: recommendation,
          efficiency: efficiency
        });

        const category = msg.includes("health") ? "Health & Vitality" : "Productivity & Performance";
        reply = `Generating your ${category} report. Analysis complete: Your Operational Efficiency is at ${efficiency}%. ${recommendation}`;
    }
    else if (msg.includes("reschedule my missed") || msg.includes("optimize my flow")) {
       executedActions.push({ type: "navigation", path: "/tasks" });
       reply = "Initiating mass rescheduling protocol for all overdue objectives. Redirecting to Task Nexus for manual confirmation.";
    }
    else if (msg.includes("productivity boost tip") || msg.includes("boost") || msg.includes("tip")) {
       const tips = [
         "Implement the Pomodoro Technique: 25 minutes of deep focus followed by a 5-minute cognitive reset.",
         "Eat the Frog: Tackle your highest-load task first to eliminate secondary cognitive friction.",
         "Batch similar operational tasks together to minimize context-switching overhead.",
         "Optimize your workspace lighting (6500K) to maintain peak alertness levels."
       ];
       reply = `Optimization Tip: ${tips[Math.floor(Math.random() * tips.length)]}`;
    }
    // ─── 1. NAVIGATION INTENT (High Priority) ───────────────────────────────
    if (["go to", "open", "navigate", "take me to", "switch to", "tab", "page", "section"].some(k => msg.includes(k)) || 
             (msg.includes("show") && (msg.includes("dashboard") || msg.includes("analytics") || msg.includes("task") || msg.includes("profile") || msg.includes("setting") || msg.includes("health") || msg.includes("ai") || msg.includes("report") || msg.includes("note")))) {
      if (msg.includes("dashboard") || msg.includes("home") || msg.includes("main")) {
        executedActions.push({ type: "navigation", path: "/dashboard" });
        reply = "Synchronizing interface with your Dashboard.";
      } else if (msg.includes("analytics") || msg.includes("stats")) {
        executedActions.push({ type: "navigation", path: "/analytics" });
        reply = "Accessing your Performance Analytics node.";
      } else if (msg.includes("task") || msg.includes("list") || msg.includes("schedule") || msg.includes("todo")) {
        executedActions.push({ type: "navigation", path: "/tasks" });
        reply = "Displaying your active Operational Tasks.";
      } else if (msg.includes("profile") || msg.includes("account") || msg.includes("user")) {
        executedActions.push({ type: "navigation", path: "/profile" });
        reply = "Opening User Profile configuration.";
      } else if (msg.includes("setting") || msg.includes("config")) {
        executedActions.push({ type: "navigation", path: "/settings" });
        reply = "Navigating to System Settings.";
      } else if (msg.includes("health") || msg.includes("fitness") || msg.includes("vitals")) {
        executedActions.push({ type: "navigation", path: "/health" });
        reply = "Opening Health & Vitality synchronization.";
      } else if (msg.includes("report") || msg.includes("insight")) {
        executedActions.push({ type: "navigation", path: "/reports" });
        reply = "Generating system reports. Accessing historical performance data.";
      } else if (msg.includes("note") || msg.includes("short note")) {
        executedActions.push({ type: "navigation", path: "/notes" });
        reply = "Opening your personal Knowledge Base (Short Notes).";
      } else if (msg.includes("ai") || msg.includes("assistant") || msg.includes("control")) {
        executedActions.push({ type: "navigation", path: "/ai-assistant" });
        reply = "You are currently in the AI Control Center.";
      } else {
        reply = "Destination unrecognized. Core locations: Dashboard, Analytics, Tasks, Profile, Health, Settings, Reports, Notes.";
      }
      return res.json({ reply, actions: executedActions });
    }

    // ─── 2. RECOMMENDATION INTENT (High Priority) ──────────────────────────
    if (
      msg.includes("recommend") || 
      msg.includes("reccomond") || // Handling common typo
      msg.includes("suggest") || 
      msg.includes("give me") || 
      msg.includes("show me") || 
      msg.includes("tell me") ||
      msg.includes("find me") ||
      msg.includes("search for")
    ) {
      if (msg.includes("movie") || msg.includes("film") || msg.includes("series") || msg.includes("show")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Movies & Series",
          links: [
            { title: "Inception (Sci-Fi / Action)", url: "https://www.imdb.com/title/tt1375666/", type: "movie" },
            { title: "Interstellar (Sci-Fi / Drama)", url: "https://www.imdb.com/title/tt0816692/", type: "movie" },
            { title: "Dark (Mystery / Sci-Fi Series)", url: "https://www.netflix.com/title/80100172", type: "series" },
            { title: "The Dark Knight (Action / Crime)", url: "https://www.imdb.com/title/tt0468569/", type: "movie" }
          ]
        });
        reply = "I've retrieved some high-rated cinematic experiences for your off-duty hours. Entertainment is vital for cognitive decompression.";
      } 
      else if (msg.includes("music") || msg.includes("song") || msg.includes("playlist")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Music & Audio",
          links: [
            { title: "Lo-Fi Beats for Focus", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", type: "video" },
            { title: "Hans Zimmer: Interstellar Suite", url: "https://open.spotify.com/album/43Yv9mIsO6W85veH3pP6N4", type: "music" },
            { title: "Deep Focus Playlist", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKzbUnY3Yz", type: "playlist" }
          ]
        });
        reply = "Accessing auditory performance-enhancing nodes. Current recommendation: High-fidelity lo-fi or orchestral arrangements for peak focus.";
      }
      else if (msg.includes("book") || msg.includes("read")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Literary Resources",
          links: [
            { title: "Atomic Habits - James Clear", url: "https://jamesclear.com/atomic-habits", type: "book" },
            { title: "Deep Work - Cal Newport", url: "https://www.calnewport.com/books/deep-work/", type: "book" },
            { title: "The Martian - Andy Weir", url: "https://www.goodreads.com/book/show/18007564-the-martian", type: "book" }
          ]
        });
        reply = "Literary data synthesized. These selections are optimized for habit formation and cognitive resilience.";
      }
      else if (msg.includes("exercise") || msg.includes("workout") || msg.includes("fitness") || msg.includes("gym")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Physical Optimization",
          links: [
            { title: "20 Min Full Body HIIT", url: "https://www.youtube.com/watch?v=ml6cT4AZdqI", type: "video" },
            { title: "Morning Yoga for Beginners", url: "https://www.youtube.com/watch?v=v7AYKMP6rOE", type: "video" },
            { title: "HealthLine: Best Exercises", url: "https://www.healthline.com/health/fitness-exercise", type: "article" }
          ]
        });
        reply = "I've gathered some high-performance physical optimization resources for you. Maintenance of the biological vessel is critical.";
      }
      else if (msg.includes("study") || msg.includes("learn") || msg.includes("education") || msg.includes("course")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Studies & Knowledge",
          links: [
            { title: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "website" },
            { title: "Khan Academy", url: "https://www.khanacademy.org/", type: "website" },
            { title: "Coursera: Free Courses", url: "https://www.coursera.org/courses?query=free", type: "website" }
          ]
        });
        reply = "Accessing educational data nodes. Knowledge acquisition is the primary driver of system evolution.";
      }
      else {
        const topic = msg.replace(/recommend|reccomond|suggest|give me|show me|tell me|find me|search for|about|some|a|something/g, "").trim();
        if (topic) {
          const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
          executedActions.push({ 
            type: "recommendations", 
            category: capitalizedTopic,
            links: [
              { title: `YouTube: ${capitalizedTopic}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`, type: "video" },
              { title: `Google Search: ${capitalizedTopic}`, url: `https://www.google.com/search?q=${encodeURIComponent(topic)}`, type: "website" },
              { title: `Wikipedia: ${capitalizedTopic}`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`, type: "article" }
            ]
          });
          reply = `I have indexed the data nodes for "${capitalizedTopic}". Here are the most relevant external resources for your review.`;
        } else {
          reply = "Please specify a topic you'd like me to recommend or search for (e.g., 'Recommend some movies' or 'Tell me about space').";
        }
      }
      return res.json({ reply, actions: executedActions });
    }

    // ─── 3. EXISTING INTENTS (LOWER PRIORITY) ──────────────────────────────────

    // ─── 2. DELETE TASK INTENT ──────────────────────────────────────────────
    else if (msg.includes("delete") || msg.includes("remove") || msg.includes("cancel") || msg.includes("clear task")) {
       let titleToFind = msg.replace(/delete|remove|cancel|the task|task|a task|clear task/g, "").trim();
       
       if (!titleToFind) {
         reply = "Please specify which task you want to delete.";
       } else {
         const allPending = await Task.find({ user: userId, completed: false });
         // Fuzzy match: check if task title contains the search term or vice versa
         const targetTask = allPending.find(t => 
           t.title.toLowerCase().includes(titleToFind) || 
           titleToFind.includes(t.title.toLowerCase())
         );
         
         if (targetTask) {
            await Task.findByIdAndDelete(targetTask._id);
            executedActions.push({ type: "task_deleted", title: targetTask.title });
            reply = `Action Confirmed: Successfully decommissioned "${targetTask.title}" from your schedule.`;
         } else {
            reply = `Error: Could not locate any pending task matching "${titleToFind}".`;
         }
       }
    }

    // ─── 3. RESCHEDULE TASK INTENT ──────────────────────────────────────────
    else if (msg.includes("reschedule") || msg.includes("move") || msg.includes("change time") || msg.includes("shift")) {
       const { time, text } = extractTime(msg);
       let titleToFind = text.replace(/reschedule|move|change time|the task|task|a task|shift|to/g, "").trim();
       
       if (time === "09:00" && !msg.match(/9\s*am/i)) { // If no time was actually found
          reply = "Please specify the new time (e.g., 'Move meeting to 3pm').";
       } else if (!titleToFind) {
          reply = "Please specify which task you'd like to reschedule.";
       } else {
         const allPending = await Task.find({ user: userId, completed: false });
         const targetTask = allPending.find(t => 
           t.title.toLowerCase().includes(titleToFind) || 
           titleToFind.includes(t.title.toLowerCase())
         );
         
         if (targetTask) {
            targetTask.startTime = time;
            await targetTask.save();
            executedActions.push({ type: "task_updated", title: targetTask.title, time: time });
            reply = `Re-optimization Complete: "${targetTask.title}" has been shifted to ${time}.`;
         } else {
            reply = `Search Failure: No task matching "${titleToFind}" was found in your active schedule.`;
         }
       }
    }

    // ─── 4. CREATE TASK INTENT ──────────────────────────────────────────────
    else if (msg.includes("create") || msg.includes("add") || msg.includes("schedule") || msg.includes("remind me") || msg.includes("put")) {
      const { time, text } = extractTime(msg);
      let title = text.replace(/create a task to|create task to|add a task to|add task to|schedule a task to|create a task for|create task for|add task for|remind me to|create|add|schedule|put|the task|a task|on my list/g, "").trim();
      
      if (!title) {
        reply = "Please specify the task description (e.g., 'Add gym at 5pm').";
      } else {
        title = title.charAt(0).toUpperCase() + title.slice(1);

        const newTask = await Task.create({
          user: userId,
          title: title,
          priority: "High",
          category: "Personal",
          startTime: time,
          endTime: "23:59",
          date: new Date(),
          completed: false
        });
        
        executedActions.push({ type: "task_created", title: newTask.title, time: time });
        reply = `Network Updated: Successfully scheduled "${newTask.title}" for ${time}.`;
      }
    }


    // ─── 6. FALLBACK ────────────────────────────────────────────────────────
    else {
       reply = "Local Core Active. I can manage tasks, navigate sections, and provide recommendations (Try: 'Recommend some exercises' or 'Help me plan a trip').";
    }

    // Trigger local events
    return res.json({ 
      reply: reply,
      actions: executedActions 
    });

  } catch (error) {
    console.error("NLP ENGINE ERROR:", error);
    res.status(500).json({
      reply: `SYSTEM FAULT: ${error.message}`,
      actions: [],
      error: error.message
    });
  }
};

module.exports = {
  chatWithAI,
};
