const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");
const { generateSchedule } = require("../services/aiScheduleService");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const msg = message.toLowerCase();
    const tasks = await Task.find({ user: userId, completed: false }).sort({ startTime: 1 });
    const completedTasks = await Task.find({ user: userId, completed: true });

    // ─── Command Routing ───────────────────────────────────────────────
    
    // 1. Plan My Day / Schedule
    if (msg.includes("plan my day") || msg.includes("schedule") || msg.includes("organize")) {
      // Fetch ALL user tasks for the current/future dates
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const allTasks = await Task.find({ user: userId }).sort({ priority: 1 });
      const aiSchedule = await generateSchedule(allTasks);

      // 🚀 COMMIT THE CHANGES TO THE DATABASE
      if (aiSchedule.schedule && aiSchedule.schedule.length > 0) {
        for (const item of aiSchedule.schedule) {
          if (item.title.toLowerCase() === "break") continue; // Skip breaks in database

          // Try to find the existing task to update it
          const existingTask = await Task.findOne({ 
            user: userId, 
            title: { $regex: new RegExp(item.title, 'i') }
          });

          const [startTimeStr] = item.timeRange.split(" - ");
          // Convert "09:00 AM" to "09:00" for the database format if needed
          let formattedTime = startTimeStr;
          if (startTimeStr.includes("AM") || startTimeStr.includes("PM")) {
             const [time, modifier] = startTimeStr.split(" ");
             let [hours, minutes] = time.split(":");
             let h = parseInt(hours, 10);
             if (modifier === "PM" && h < 12) h += 12;
             if (modifier === "AM" && h === 12) h = 0;
             formattedTime = `${String(h).padStart(2, '0')}:${minutes}`;
          }

          if (existingTask) {
            existingTask.startTime = formattedTime;
            existingTask.date = today;
            await existingTask.save();
          } else {
            // If the AI suggests a new task not in the list, create it
            await Task.create({
              user: userId,
              title: item.title,
              startTime: formattedTime,
              date: today,
              completed: false,
              priority: "Medium"
            });
          }
        }
      }

      return res.json({
        reply: aiSchedule.explanation || "I've analyzed all your tasks and synchronized your operational flow. Your schedule has been updated.",
        actions: aiSchedule.schedule.map(s => ({ type: "schedule", ...s }))
      });
    }

    // 2. Boost / Productivity Tip
    if (msg.includes("boost") || msg.includes("productivity") || msg.includes("tip")) {
      const tips = [
        "Your focus is currently peaking. Try tackling your most complex 'High' priority task right now.",
        "Detected a pattern of afternoon fatigue. Shift your administrative tasks to after 3 PM.",
        "Operational efficiency increases by 15% when you take a 5-minute movement break every hour.",
        "Your streak is improving. Completing one more task now will secure your 'Focus Master' milestone."
      ];
      return res.json({
        reply: tips[Math.floor(Math.random() * tips.length)]
      });
    }

    // 3. Review / Performance
    if (msg.includes("review") || msg.includes("performance") || msg.includes("how am i doing")) {
      const ratio = completedTasks.length / (tasks.length + completedTasks.length || 1);
      let feedback = "";
      if (ratio > 0.8) feedback = "You are operating at peak efficiency. Your synchronization with the schedule is flawless.";
      else if (ratio > 0.5) feedback = "Steady operational progress. A few strategic adjustments to your morning routine could boost your output.";
      else feedback = "System load is high. I recommend rescheduling low-priority items to prevent cognitive fatigue.";

      return res.json({
        reply: `Operational Review: ${Math.round(ratio * 100)}% completion rate. ${feedback}`
      });
    }

    // 4. Navigation Commands
    if (msg.includes("open") || msg.includes("go to") || msg.includes("show me")) {
      let target = null;
      let path = null;

      if (msg.includes("analytics") || msg.includes("intelligence") || msg.includes("performance")) {
        target = "Analytics";
        path = "/analytics";
      } else if (msg.includes("tasks") || msg.includes("flow") || msg.includes("schedule")) {
        target = "Tasks";
        path = "/tasks";
      } else if (msg.includes("dashboard") || msg.includes("home") || msg.includes("overview")) {
        target = "Dashboard";
        path = "/dashboard";
      } else if (msg.includes("reports") || msg.includes("weather") || msg.includes("matrix")) {
        target = "Reports";
        path = "/reports";
      } else if (msg.includes("assistant") || msg.includes("chat") || msg.includes("ai")) {
        target = "AI Assistant";
        path = "/ai-assistant";
      }

      if (target && path) {
        return res.json({
          reply: `Synchronizing interface... Opening the ${target} node now.`,
          actions: [{ type: "navigation", path }]
        });
      }
    }

    // ─── Default AI Generation ──────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ 
        reply: "I'm currently in smart-offline mode. I can still handle 'Plan My Day', 'Boost', and 'Performance Review' commands perfectly. For general chat, please configure the system API key." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a helpful and professional Smart Life Assistant. 
    Current User Context: ${tasks.length} pending tasks, ${completedTasks.length} completed tasks.
    User Message: "${message}". 
    Provide a concise, motivating, and highly professional response. Use operational and technical terminology like 'synchronization', 'peak performance', 'cognitive load'.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    res.status(500).json({
      message: "AI Service Interference",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};
