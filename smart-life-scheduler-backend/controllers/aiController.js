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

    // ─── 0. CONTEXTUAL FLOW HANDLING (Highest Priority) ─────────────────────
    if (user.aiContext?.flow) {
      if (msg === "cancel" || msg === "exit" || msg === "stop") {
        user.aiContext = { flow: null, step: 0, data: {} };
        await user.save();
        return res.json({ reply: "Flow terminated. System returning to standby mode.", actions: [] });
      }

      let context = user.aiContext;

      // STEP 1: Study Subjects
      if (context.step === 1) {
        const subjects = message.split(/[,;|]|\band\b/).map(s => s.trim()).filter(s => s.length > 0);
        if (subjects.length === 0) {
          reply = "I couldn't identify any subjects. Please list the topics you want to cover.";
        } else {
          context.data.subjects = subjects;
          context.step = 2;
          user.markModified('aiContext');
          await user.save();
          reply = `Acknowledged. I've noted: ${subjects.join(", ")}.\n\nFinal step: What are your preferred daily timings for this roadmap? (e.g., 9am to 5pm)`;
        }
        return res.json({ reply, actions: [] });
      } 
      else if (context.step === 2) {
        const { startTime, endTime } = extractTime(msg);
        const { subjects, days, topic } = context.data;
        const totalDays = parseInt(days);
        const subjectsPerDay = Math.ceil(subjects.length / totalDays);
        const startDate = new Date();
        const createdTasks = [];

        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i + 1); 
          const dateStr = currentDate.toISOString().split('T')[0];
          const daySubjects = subjects.slice(i * subjectsPerDay, (i + 1) * subjectsPerDay);

          daySubjects.forEach((subject) => {
            const task = new Task({
              user: userId,
              title: `${topic}: ${subject}`,
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
        reply = `Success! I've orchestrated your ${totalDays}-day ${topic} roadmap. ${createdTasks.length} sessions synchronized. 🚀`;
        return res.json({ reply, actions: executedActions });
      }
    }

    // ─── 1. ARCHITECT PROTOCOL (Study Roadmap) ───────────────────────────────
    if (msg.includes("prepare") && (msg.includes("schedule") || msg.includes("roadmap") || msg.includes("plan"))) {
      const dayMatch = msg.match(/(\d+)\s*day/i);
      const days = dayMatch ? dayMatch[1] : "5";
      const topic = msg.replace(/prepare|schedule|roadmap|plan|\d+\s*day|for/gi, "").trim() || "Deep Learning";

      user.aiContext = { flow: "scheduling", step: 1, data: { topic, days } };
      user.markModified('aiContext');
      await user.save();

      reply = `I've initiated the **Architect Protocol** for your ${days}-day "${topic}" roadmap. 🏗️\n\nPlease provide the subjects or modules you wish to cover.`;
      return res.json({ reply, actions: [] });
    }

    // ─── 2. NAVIGATION (High Priority) ──────────────────────────────────────
    const navKeywords = ["go to", "open", "navigate", "take me to", "switch to", "tab", "page", "section", "show me the", "show the", "view"];
    if (navKeywords.some(k => msg.includes(k))) {
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
        reply = "Accessing your System Reports node.";
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

    // ─── 3. RECOMMENDATIONS (High Priority - Movies, Music, Travel, Fitness) ──
    const recKeywords = ["recommend", "reccomond", "suggest", "give", "show", "tell me", "find", "search", "something to", "look for", "plan my"];
    if (recKeywords.some(k => msg.includes(k))) {
      // TRAVEL PLANNING
      if (msg.includes("trip") || msg.includes("travel") || msg.includes("vacation") || msg.includes("holiday") || msg.includes("flight") || msg.includes("hotel")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Travel & Exploration",
          links: [
            { title: "SkyScanner (Best Flights)", url: "https://www.skyscanner.com", type: "website" },
            { title: "Booking.com (Top Stays)", url: "https://www.booking.com", type: "website" },
            { title: "Google Travel (Trip Planner)", url: "https://www.google.com/travel", type: "website" },
            { title: "TripAdvisor (Local Guides)", url: "https://www.tripadvisor.com", type: "website" }
          ]
        });
        reply = "I've indexed prime travel nodes for your expedition. Exploration is essential for system rejuvenation. Would you like me to create a 'Travel Prep' task block?";
      } 
      // MOVIES & SERIES
      else if (msg.includes("movie") || msg.includes("film") || msg.includes("series") || msg.includes("show")) {
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
        reply = "Accessing high-rated cinematic nodes. Entertainment is vital for cognitive decompression.";
      } 
      // MUSIC & AUDIO
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
        reply = "Auditory performance-enhancing nodes retrieved. Switch to high-fidelity lo-fi for peak focus.";
      }
      // EXERCISE & FITNESS
      else if (msg.includes("exercise") || msg.includes("workout") || msg.includes("fitness") || msg.includes("gym")) {
        executedActions.push({ 
          type: "recommendations", 
          category: "Physical Optimization",
          links: [
            { title: "20 Min Full Body HIIT", url: "https://www.youtube.com/watch?v=ml6cT4AZdqI", type: "video" },
            { title: "Morning Yoga for Beginners", url: "https://www.youtube.com/watch?v=v7AYKMP6rOE", type: "video" },
            { title: "HealthLine: Exercises", url: "https://www.healthline.com/health/fitness-exercise", type: "article" }
          ]
        });
        reply = "Biological vessel maintenance resources localized. HIIT and Yoga are currently top-optimized for your profile.";
      }
      // GENERAL SEARCH / OTHER
      else {
        const topic = msg.replace(/recommend|reccomond|suggest|give|show|tell me|find|search|something|look for|a|the|about|to/g, "").trim();
        if (topic && topic.length > 2) {
          const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
          executedActions.push({ 
            type: "recommendations", 
            category: capitalizedTopic,
            links: [
              { title: `YouTube: ${capitalizedTopic}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`, type: "video" },
              { title: `Google Search: ${capitalizedTopic}`, url: `https://www.google.com/search?q=${encodeURIComponent(topic)}`, type: "website" }
            ]
          });
          reply = `I have indexed the data nodes for "${capitalizedTopic}". Opening relevant external connections.`;
        } else {
            // If they just said "recommend", don't fall back yet, ask what they want.
            reply = "I can recommend movies, music, travel destinations, or exercises. What would you like to explore?";
        }
      }
      return res.json({ reply, actions: executedActions });
    }

    // ─── 4. OPERATIONAL COMMANDS (Plan Day, CRUD Tasks, etc.) ───────────────
    
    // PLAN MY DAY / ANALYZE LOAD
    if (msg.includes("plan my day") || msg.includes("analyze my load") || (msg.includes("plan") && msg.includes("day"))) {
       const todayDate = new Date();
       todayDate.setHours(0, 0, 0, 0);
       const todayStr = todayDate.toISOString().split('T')[0];
       const overdueTasks = await Task.find({ user: userId, completed: false, date: { $lt: todayStr } });
       if (overdueTasks.length > 0) {
         await Task.updateMany({ _id: { $in: overdueTasks.map(t => t._id) } }, { $set: { date: todayStr } });
       }
       const tasks = await Task.find({ user: userId, date: todayStr });
       const currentTimeStr = new Date().toTimeString().split(' ')[0];
       executedActions.push({
         type: "categorized_schedule",
         recoveredCount: overdueTasks.length,
         completed: tasks.filter(t => t.completed),
         missed: tasks.filter(t => !t.completed && t.endTime < currentTimeStr),
         pending: tasks.filter(t => !t.completed && t.endTime >= currentTimeStr)
       });
       reply = overdueTasks.length > 0 
         ? `System analysis complete. recovered **${overdueTasks.length} missed objectives**. Total tasks today: ${tasks.length}.`
         : `Operational load analyzed. Your current schedule is synchronized. Total targets today: ${tasks.length}.`;
       return res.json({ reply, actions: executedActions });
    }

    // DELETE TASK
    if (msg.includes("delete") || msg.includes("remove") || msg.includes("cancel") || msg.includes("clear task")) {
       let titleToFind = msg.replace(/delete|remove|cancel|the task|task|a task|clear task/g, "").trim();
       if (titleToFind) {
         const targetTask = await Task.findOne({ user: userId, completed: false, title: new RegExp(titleToFind, 'i') });
         if (targetTask) {
           await Task.findByIdAndDelete(targetTask._id);
           executedActions.push({ type: "task_deleted", title: targetTask.title });
           reply = `Decommissioned "${targetTask.title}" from your schedule.`;
         } else reply = `Failed to locate matching task "${titleToFind}".`;
       } else reply = "Specify which task to delete.";
       return res.json({ reply, actions: executedActions });
    }

    // CREATE TASK
    if (msg.includes("create") || msg.includes("add") || msg.includes("schedule") || msg.includes("remind me") || msg.includes("put")) {
      const { time, text } = extractTime(msg);
      let title = text.replace(/create a task to|create task to|add a task to|add task to|schedule a task|remind me to|create|add|schedule|put|the task|a task/g, "").trim();
      if (title) {
        title = title.charAt(0).toUpperCase() + title.slice(1);
        const newTask = await Task.create({ user: userId, title, priority: "High", category: "Personal", startTime: time, endTime: "23:59", date: new Date(), completed: false });
        executedActions.push({ type: "task_created", title: newTask.title, time: time });
        reply = `Scheduled "${newTask.title}" for ${time}.`;
      } else reply = "Specify the task description.";
      return res.json({ reply, actions: executedActions });
    }

    // REPORTS / ANALYTICS
    if ((msg.includes("report") || msg.includes("analyze") || msg.includes("review")) && (msg.includes("productivity") || msg.includes("health") || msg.includes("performance"))) {
       const allTasks = await Task.find({ user: userId });
       const completed = allTasks.filter(t => t.completed);
       const total = allTasks.length;
       const efficiency = total > 0 ? Math.round((completed.length / total) * 100) : 100;
       executedActions.push({
         type: "comprehensive_report",
         efficiency: efficiency,
         completed: completed.map(t => ({ title: t.title })),
         missed: allTasks.filter(t => !t.completed).map(t => ({ title: t.title })),
         suggestion: "Maintain steady performance to hit your peak index."
       });
       reply = `Generating performance report. Efficiency: ${efficiency}%. Actionable feedback generated above.`;
       return res.json({ reply, actions: executedActions });
    }

    // ─── 5. FALLBACK ────────────────────────────────────────────────────────
    reply = "Core Systems Active. I can manage tasks, navigate sections, and provide recommendations (Movies, Music, Travel, Fitness). What can I assist with?";
    return res.json({ reply, actions: executedActions });

  } catch (error) {
    console.error("NLP ENGINE ERROR:", error);
    res.status(500).json({ reply: `SYSTEM FAULT: ${error.message}`, actions: [] });
  }
};

module.exports = { chatWithAI };
