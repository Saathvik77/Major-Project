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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found. Using mock response.");
      if (message.toLowerCase().includes("plan my day") || message.toLowerCase().includes("schedule")) {
        const tasks = await Task.find({ user: userId, completed: false });
        const aiSchedule = await generateSchedule(tasks);
        
        return res.json({
          reply: aiSchedule.explanation,
          actions: aiSchedule.schedule.map(s => ({ type: "schedule", ...s }))
        });
      }
      return res.json({ reply: "I'm currently in offline mode, but I can still help you plan your day! Try clicking the 'Plan My Day' quick action." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Special handling for "plan my day" or similar commands
    if (message.toLowerCase().includes("plan my day") || message.toLowerCase().includes("schedule")) {
      const tasks = await Task.find({ user: userId, completed: false });
      const aiSchedule = await generateSchedule(tasks);
      
      return res.json({
        reply: aiSchedule.explanation,
        actions: aiSchedule.schedule.map(s => ({ type: "schedule", ...s }))
      });
    }

    // Default chat behavior
    const prompt = `You are a helpful and professional Smart Life Assistant. The user says: "${message}". 
    Provide a concise, motivating, and helpful response. If the user asks about their tasks, encourage them to stay focused.
    If the user asks to plan their day, suggest they use the 'Plan My Day' quick action.
    Keep the tone professional yet encouraging. Use emojis sparingly.`;

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
