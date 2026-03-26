const Task = require("../models/Task");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const msg = message.toLowerCase().trim();
    const executedActions = [];
    let reply = "";

    // helper to extract time from string (e.g., "at 6pm", "for 3:30", "by 10 am")
    const extractTime = (str) => {
      const timeMatch = str.match(/(?:at|for|by|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (!timeMatch) return { time: "09:00", text: str };
      
      let timeStr = timeMatch[1].toLowerCase();
      let [rawHrs, mins] = timeStr.replace(/am|pm/g, '').split(':');
      let hours = parseInt(rawHrs);
      mins = mins || "00";
      if (timeStr.includes("pm") && hours < 12) hours += 12;
      if (timeStr.includes("am") && hours === 12) hours = 0;
      
      const formattedTime = `${String(hours).padStart(2, '0')}:${mins.padStart(2, '0')}`;
      const remainingText = str.replace(timeMatch[0], "").trim();
      return { time: formattedTime, text: remainingText };
    };

    // ─── 0. QUICK COMMANDS (High Priority) ────────────────────────────────
    if (msg.includes("plan my day") || msg.includes("analyze my load") || (msg.includes("plan") && msg.includes("day"))) {
       const today = new Date().toISOString().split('T')[0];
       const tasks = await Task.find({ user: userId, date: today });
       const completed = tasks.filter(t => t.completed);
       const missed = tasks.filter(t => !t.completed && t.endTime < new Date().toTimeString().split(' ')[0]);
       const pending = tasks.filter(t => !t.completed && t.endTime >= new Date().toTimeString().split(' ')[0]);

       executedActions.push({
         type: "categorized_schedule",
         completed,
         missed,
         pending
       });
       reply = "Operational load analyzed. I've optimized your schedule for maximum focus. Review your milestones above.";
    }
    else if (msg.includes("productivity") || msg.includes("health") || msg.includes("report")) {
       const allTasks = await Task.find({ user: userId });
       const completed = allTasks.filter(t => t.completed);
       const missed = allTasks.filter(t => !t.completed && (t.isOverdue || (t.endTime && t.endTime < new Date().toTimeString().split(' ')[0])));
       const rescheduled = allTasks.filter(t => t.rescheduledCount > 0);

       executedActions.push({
         type: "comprehensive_report",
         completed: completed.map(t => ({ title: t.title, date: t.date })),
         missed: missed.map(t => ({ title: t.title, date: t.date })),
         rescheduled: rescheduled.map(t => ({ title: t.title, date: t.date, count: t.rescheduledCount }))
       });

       const category = msg.includes("health") ? "Health & Vitality" : "Productivity & Performance";
       reply = `Generating your ${category} report. I've aggregated all operational data, including completed milestones, missed objectives, and rescheduled nodes for a full system audit.`;
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
    else if (msg.includes("weekly operational performance") || msg.includes("review my performance")) {
       executedActions.push({ type: "navigation", path: "/analytics" });
       reply = "Retrieving weekly performance metrics. Knowledge is the foundation of iterative optimization. Opening Analytics Card.";
    }

    // ─── 1. NAVIGATION INTENT ──────────────────────────────────────────────
    const navKeywords = ["go to", "open", "show", "navigate", "take me to", "switch to"];
    const isNav = navKeywords.some(k => msg.includes(k));
    
    if (isNav) {
      if (msg.includes("dashboard") || msg.includes("home") || msg.includes("main")) {
        executedActions.push({ type: "navigation", path: "/dashboard" });
        reply = "Synchronizing interface with your Dashboard.";
      } else if (msg.includes("analytics") || msg.includes("performance") || msg.includes("stats") || msg.includes("report")) {
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
      } else if (msg.includes("ai") || msg.includes("assistant") || msg.includes("control")) {
        executedActions.push({ type: "navigation", path: "/ai-assistant" });
        reply = "You are currently in the AI Control Center.";
      } else {
        reply = "Destination unrecognized. Core locations: Dashboard, Analytics, Tasks, Profile, Health, Settings.";
      }
    }

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

    // ─── 6. RECOMMENDATION INTENT ──────────────────────────────────────────
    else if (msg.includes("exercise") || msg.includes("workout") || msg.includes("fitness") || msg.includes("gym")) {
       executedActions.push({ 
         type: "recommendations", 
         category: "Exercise",
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
         category: "Studies",
         links: [
           { title: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "website" },
           { title: "Khan Academy", url: "https://www.khanacademy.org/", type: "website" },
           { title: "Coursera: Free Courses", url: "https://www.coursera.org/courses?query=free", type: "website" }
         ]
       });
       reply = "Accessing educational data nodes. Knowledge acquisition is the primary driver of system evolution.";
    }
    else if (msg.includes("trip") || msg.includes("travel") || msg.includes("vacation") || msg.includes("plan a trip")) {
       executedActions.push({ 
         type: "recommendations", 
         category: "Trip Planning",
         links: [
           { title: "Google Flights", url: "https://www.google.com/travel/flights", type: "website" },
           { title: "Airbnb: Unique Stays", url: "https://www.airbnb.com/", type: "website" },
           { title: "TripAdvisor: Top Places", url: "https://www.tripadvisor.com/", type: "website" }
         ]
       });
       reply = "Initiating travel log optimization. Exploration of diverse geolocations enhances operational perspective.";
    }
    else if (msg.includes("recommend") || msg.includes("tell me about") || msg.includes("search for") || msg.includes("resources for") || msg.includes("suggest")) {
       const topic = msg.replace(/recommend|tell me about|search for|resources for|suggest|something about|about|a|some/g, "").trim();
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
         reply = "Please specify a topic you'd like me to recommend or search for (e.g., 'Recommend machine learning' or 'Tell me about space').";
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
