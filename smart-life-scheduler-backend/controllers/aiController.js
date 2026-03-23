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
    
    if (msg.includes("plan my day") || msg.includes("schedule") || msg.includes("organize")) {
      const now = new Date();
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDateStr = now.toDateString();
      
      // Fetch ALL uncompleted tasks (AI will decide what is overdue/today)
      const allUncompleted = await Task.find({ user: userId, completed: false });
      
      // Fetch tasks completed TODAY (using updatedAt since it's most reliable)
      const completedToday = await Task.find({ 
        user: userId, 
        completed: true, 
        updatedAt: { $gte: today } 
      });

      const aiSchedule = await generateSchedule({
        tasks: allUncompleted,
        completedToday: completedToday,
        context: { currentTime, currentDateStr }
      });

      // Defensive fallback
      if (!aiSchedule.categorizedSchedule) {
        aiSchedule.categorizedSchedule = {
          completed: [],
          missed: [],
          pending: aiSchedule.schedule || []
        };
      }

      // 🚀 COMMIT THE CHANGES TO THE DATABASE (Only for missed and pending)
      const flatSchedule = [
        ...(aiSchedule.categorizedSchedule?.missed || []),
        ...(aiSchedule.categorizedSchedule?.pending || [])
      ];

      if (flatSchedule.length > 0) {
        for (const item of flatSchedule) {
          if (item.title.toLowerCase() === "break") continue;

          const existingTask = await Task.findOne({ 
            user: userId, 
            title: { $regex: new RegExp(item.title, 'i') },
            completed: false 
          });

          const [startTimeStr] = item.timeRange.split(" - ");
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

      const { weatherData } = req.body;
      let extraNote = "";
      if (weatherData) {
        const temp = weatherData.temperature;
        const code = weatherData.weathercode;
        if (code <= 2 && temp >= 10 && temp <= 32) extraNote = " The weather is perfect for a 30-minute outdoor run or cycling session! 🏃‍♀️🚴‍♂️";
        else if (code >= 51) extraNote = " It's raining, so I recommend an indoor HIIT workout or yoga session. 🧘‍♂️";
        else extraNote = " Consider a light indoor stretching session to maintain operational flow. 🤸‍♂️";
      }

      return res.json({
        reply: (aiSchedule.explanation || "Your schedule has been updated.") + extraNote,
        actions: [{ type: "categorized_schedule", ...aiSchedule.categorizedSchedule }]
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

    // 3. Review / Performance / Sports
    if (msg.includes("review") || msg.includes("performance") || msg.includes("how am i doing")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDateStr = now.toDateString();

      const allUncompleted = await Task.find({ user: userId, completed: false });
      const totalCompletedCount = await Task.countDocuments({ user: userId, completed: true });
      
      let completedToReview = await Task.find({ 
        user: userId, 
        completed: true, 
        updatedAt: { $gte: today } 
      });

      // If nothing today, show the 5 most recent achievements
      if (completedToReview.length === 0) {
        completedToReview = await Task.find({ 
          user: userId, 
          completed: true 
        }).sort({ updatedAt: -1 }).limit(5);
      }

      const total = allUncompleted.length + totalCompletedCount;
      const ratio = totalCompletedCount / (total || 1);
      
      const highPriorityTasks = allUncompleted.filter(t => t.priority === "High");

      let feedback = "";
      if (ratio > 0.8) feedback = "You are operating at peak efficiency. Your synchronization with the schedule is flawless.";
      else if (ratio > 0.5) feedback = "Steady operational progress. I recommend focusing on your " + (highPriorityTasks.length > 0 ? highPriorityTasks[0].title : "remaining") + " high-priority items next.";
      else feedback = "System load is high. You have " + highPriorityTasks.length + " high-priority tasks pending. I recommend rescheduling low-priority items to prevent cognitive fatigue.";

      // Use AI to get the categorization if we want a formal report
      const aiSchedule = await generateSchedule({
        tasks: allUncompleted,
        completedToday: completedToReview,
        context: { currentTime, currentDateStr }
      });

      // Defensive fallback
      if (!aiSchedule.categorizedSchedule) {
        aiSchedule.categorizedSchedule = {
          completed: completedToReview.map(t => ({ title: t.title })),
          missed: [],
          pending: aiSchedule.schedule || []
        };
      }

      return res.json({
        reply: `Operational Review: ${totalCompletedCount} total milestones achieved (${Math.round(ratio * 100)}% completion rate). ${feedback} ${aiSchedule.explanation}`,
        actions: [{ type: "categorized_schedule", ...aiSchedule.categorizedSchedule }]
      });
    }

    if (msg.includes("sport") || msg.includes("exercise") || msg.includes("workout")) {
       const { weatherData } = req.body;
       let sportSuggestion = "A 20-minute indoor yoga session is a great way to stay active today. 🧘‍♂️";
       
       if (weatherData) {
         const temp = weatherData.temperature;
         const code = weatherData.weathercode;

         if (code <= 2 && temp >= 10 && temp <= 32) {
           sportSuggestion = "It's beautifully sunny! I highly suggest a 30-minute outdoor cycling session or a run. 🚴‍♂️🏃‍♀️";
         } else if (code >= 51) {
           sportSuggestion = "It's rainy right now. How about a home HIIT workout or lifting weights at the gym? 🏋️‍♂️";
         } else if (temp < 10 || (code >= 71 && code <= 77)) {
           sportSuggestion = "It's pretty chilly outside! A nice warm indoor yoga or stretching session is perfect. 🧘‍♀️";
         } else {
           sportSuggestion = "Mild weather. A brisk outdoor walk or a light jog would be excellent. 🚶‍♂️";
         }
       } else {
         const suggestions = [
           "A 30-minute high-intensity interval training (HIIT) session would optimize your performance.",
           "A brisk 5km run would be ideal for mental clarity right now.",
           "I recommend a 20-minute yoga flow to reset your neural pathways.",
           "A strength training session targeting your core is advised."
         ];
         sportSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
       }

       return res.json({
         reply: sportSuggestion
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

    // 5. List Pending Tasks
    if (msg.includes("get tasks") || msg.includes("list tasks") || msg.includes("pending tasks") || msg.includes("show my tasks")) {
      const pending = await Task.find({ user: userId, completed: false }).sort({ startTime: 1 });
      
      if (pending.length === 0) {
        return res.json({
          reply: "Your operational log is currently clear. No pending tasks detected. Ready for new input.",
        });
      }

      return res.json({
        reply: `I've retrieved ${pending.length} pending tasks from your operational flow.`,
        actions: pending.map(t => ({ 
          type: "task_list", 
          title: t.title, 
          time: t.startTime, 
          priority: t.priority 
        }))
      });
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
