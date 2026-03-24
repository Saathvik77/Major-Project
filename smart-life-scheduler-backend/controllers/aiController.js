const Task = require("../models/Task");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const msg = message.toLowerCase();
    const executedActions = [];
    let reply = "I didn't quite catch that. Try 'create a task to [action]', 'delete [task]', or 'navigate to [page]'.";

    // ─── 1. NAVIGATION INTENT ──────────────────────────────────────────────
    if (msg.includes("go to") || msg.includes("open") || msg.includes("show") || msg.includes("navigate") || msg.includes("take me to")) {
      if (msg.includes("dashboard") || msg.includes("home")) {
        executedActions.push({ type: "navigation", path: "/dashboard" });
        reply = "Navigating to your Dashboard.";
      } else if (msg.includes("analytics") || msg.includes("performance") || msg.includes("stats")) {
        executedActions.push({ type: "navigation", path: "/analytics" });
        reply = "Opening your Performance Analytics.";
      } else if (msg.includes("task") || msg.includes("list")) {
        executedActions.push({ type: "navigation", path: "/tasks" });
        reply = "Opening your Task Log.";
      } else {
        reply = "I couldn't find that destination. Available locations: Dashboard, Analytics, or Tasks.";
      }
    }

    // ─── 2. DELETE TASK INTENT ──────────────────────────────────────────────
    else if (msg.includes("delete") || msg.includes("remove") || msg.includes("cancel") || msg.includes("clear")) {
       let titleToFind = msg.replace(/delete|remove|cancel|the task|task|a task/g, "").trim();
       
       const allPending = await Task.find({ user: userId, completed: false });
       const targetTask = allPending.find(t => t.title.toLowerCase().includes(titleToFind));
       
       if (targetTask) {
          await Task.findByIdAndDelete(targetTask._id);
          executedActions.push({ type: "task_deleted", title: targetTask.title });
          reply = `Action Executed: Successfully deleted "${targetTask.title}".`;
       } else {
          reply = `Target Not Found: Could not locate a pending task matching "${titleToFind}".`;
       }
    }

    // ─── 3. RESCHEDULE TASK INTENT ──────────────────────────────────────────
    else if (msg.includes("reschedule") || msg.includes("move") || msg.includes("change")) {
       let context = msg.replace(/reschedule|move|change|the task|task|a task/g, "").trim();
       const timeMatch = context.match(/to\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
       
       if (timeMatch) {
         let timeStr = timeMatch[1].toLowerCase();
         let titleToFind = context.replace(timeMatch[0], "").replace(/to/g, "").trim();
         
         let formattedTime = "09:00";
         let [rawHrs, mins] = timeStr.replace(/am|pm/g, '').split(':');
         let hours = parseInt(rawHrs) || 9;
         mins = mins || "00";
         if (timeStr.includes("pm") && hours < 12) hours += 12;
         if (timeStr.includes("am") && hours === 12) hours = 0;
         formattedTime = `${String(hours).padStart(2, '0')}:${mins.padStart(2, '0')}`;
         
         const allPending = await Task.find({ user: userId, completed: false });
         const targetTask = allPending.find(t => t.title.toLowerCase().includes(titleToFind));
         
         if (targetTask) {
            targetTask.startTime = formattedTime;
            await targetTask.save();
            executedActions.push({ type: "task_updated", title: targetTask.title });
            reply = `Action Executed: Rescheduled "${targetTask.title}" to ${formattedTime}.`;
         } else {
            reply = `Target Not Found: Could not locate a pending task matching "${titleToFind}".`;
         }
       } else {
         reply = "Incomplete Command: Please specify the new time (e.g., 'to 3pm').";
       }
    }

    // ─── 4. CREATE TASK INTENT ──────────────────────────────────────────────
    else if (msg.includes("create") || msg.includes("add") || msg.includes("schedule") || msg.includes("remind me")) {
      let title = msg.replace(/create a task to|create task to|add a task to|add task to|schedule a task to|create a task for|create task for|add task for|remind me to|create|add|schedule/g, "").trim();
      let timeStr = "";
      
      const timeMatch = title.match(/(?:at|for|by)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (timeMatch) {
        timeStr = timeMatch[1].toLowerCase();
        title = title.replace(timeMatch[0], "").trim();
      }
      
      let formattedTime = "09:00"; 
      if (timeStr) {
         let [rawHrs, mins] = timeStr.replace(/am|pm/g, '').split(':');
         let hours = parseInt(rawHrs) || 9;
         mins = mins || "00";
         if (timeStr.includes("pm") && hours < 12) hours += 12;
         if (timeStr.includes("am") && hours === 12) hours = 0;
         formattedTime = `${String(hours).padStart(2, '0')}:${mins.padStart(2, '0')}`;
      }

      if (!title) title = "New Routine Task";
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const newTask = await Task.create({
        user: userId,
        title: title,
        priority: "High",
        category: "Personal",
        startTime: formattedTime,
        endTime: "23:59",
        date: new Date(),
        completed: false
      });
      
      executedActions.push({ type: "task_created", title: newTask.title });
      reply = `Action Executed: Successfully scheduled "${newTask.title}" at ${formattedTime}.`;
    }
    
    // ─── 5. FALLBACK ────────────────────────────────────────────────────────
    else {
       reply = "Local Operator Mode Active. State your action: 'create', 'delete', 'reschedule', or 'navigate'.";
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
