const IntelligenceReport = require("../models/IntelligenceReport");
const IntelligenceHistory = require("../models/IntelligenceHistory");
const Task = require("../models/Task");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { runIntelligencePipeline } = require("../intelligence/intelligenceEngine");
const calculateAdvancedAnalytics = require("../services/advancedAnalyticsService");
const adaptiveReschedule = require("../services/adaptiveSchedulerService");

/* =====================================================
   RUN FULL INTELLIGENCE PIPELINE
===================================================== */
const runIntelligence = async (req, res) => {
  try {
    const {
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
      tasks,
      healthData,
    } = req.body;

    const intelligenceReport = runIntelligencePipeline({
      dailyData,
      weeklyData,
      last7Days,
      last30Days,
    });

    await IntelligenceReport.create({
      user: req.user._id,
      dailyScore: intelligenceReport.dailyScore,
      weeklyScore: intelligenceReport.weeklyScore,
      behaviorProfile: intelligenceReport.behaviorProfile,
      healthRisk: intelligenceReport.healthRisk,
      scheduleAdjustments: intelligenceReport.scheduleAdjustments,
    });

    const analytics = calculateAdvancedAnalytics(
      tasks || [],
      healthData || {}
    );

    const savedReport = await IntelligenceHistory.create({
      user: req.user._id,
      type: "weekly",
      productivityScore: analytics.productivityScore,
      healthScore: analytics.healthScore,
      insights: analytics.insights,
      suggestions: analytics.suggestions,
      rawDataSnapshot: {
        tasks: tasks || [],
        healthData: healthData || {},
      },
    });

    const rescheduleResult = adaptiveReschedule(
      tasks || [],
      healthData?.energyLevel || "medium"
    );

    res.json({
      baseIntelligence: intelligenceReport,
      advancedAnalytics: savedReport,
      adaptiveScheduling: rescheduleResult,
    });

  } catch (error) {
    console.error("INTELLIGENCE ERROR:", error);
    res.status(500).json({
      message: "Intelligence Engine Failed",
      error: error.message,
    });
  }
};

/* =====================================================
   ANALYTICS: SUMMARY
===================================================== */
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });

    const completed = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const pending = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    const overdue = await Task.countDocuments({
      user: userId,
      completed: false,
      deadline: { $lt: new Date() },
    });

    const completedRatio = totalTasks === 0 ? "0%" : `${Math.round((completed / totalTasks) * 100)}%`;
    const productivityScore = completedRatio; // For now, use completion ratio as score

    res.json({
      totalTasks,
      completed,
      pending,
      overdue,
      completedRatio,
      productivityScore
    });

  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

/* =====================================================
   ANALYTICS: PRODUCTIVITY
===================================================== */
const getProductivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ user: userId });

    const completed = await Task.countDocuments({
      user: userId,
      completed: true,
    });

    const score = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ score });

  } catch (error) {
    console.error("PRODUCTIVITY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch productivity" });
  }
};

/* =====================================================
   ANALYTICS: RECOMMENDATIONS
===================================================== */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const pendingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
    });

    const tasks = await Task.find({ user: userId });

    let recommendations = [];

    if (pendingTasks > 5) {
      recommendations.push(
        "You have many pending tasks. Try prioritizing high-impact tasks."
      );
    }

    // ----------------------------------------------------
    // 🔥 AI SCHEDULE ANALYZER (NLP RECOMMENDATIONS)
    // ----------------------------------------------------
    const lateMealKeywords = ["eat", "meal", "dinner", "food", "supper", "snack"];
    const lateWorkoutKeywords = ["gym", "workout", "exercise", "lift", "run"];
    const sleepKeywords = ["sleep", "bed", "rest"];

    tasks.forEach((task) => {
      if (!task.startTime || task.completed) return;

      const titleText = task.title.toLowerCase();
      const startHour = parseInt(task.startTime.split(":")[0]);

      // 1. LATE MEALS
      if (lateMealKeywords.some(kw => titleText.includes(kw))) {
        if (startHour >= 20) { // 8 PM or later
          recommendations.push(`AI Notice: Eating "${task.title}" at ${task.startTime} is quite late. Try eating earlier in the evening for better digestion and sleep quality.`);
        }
      }

      // 2. LATE WORKOUTS
      if (lateWorkoutKeywords.some(kw => titleText.includes(kw))) {
        if (startHour >= 21) { // 9 PM or later
          recommendations.push(`AI Notice: Your "${task.title}" task is scheduled very late (${task.startTime}). High intensity exercise before bed can disrupt your sleep cycle.`);
        }
      }

      // 3. LATE SLEEP
      if (sleepKeywords.some(kw => titleText.includes(kw))) {
        if (startHour >= 0 && startHour < 5) { // Midnight to 5 AM
          recommendations.push(`AI Notice: Your "${task.title}" target is highly irregular (${task.startTime}). A consistent, earlier bedtime is critical for lowering stress.`);
        } else if (startHour >= 23) { // 11 PM or later
          recommendations.push(`AI Notice: You are scheduled to "${task.title}" at ${task.startTime}. Consider winding down 30 minutes earlier to improve your daily recovery.`);
        }
      }
    });
    // ----------------------------------------------------

    if (pendingTasks === 0 && recommendations.length === 0) {
      recommendations.push(
        "Great job! You are fully on track."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Maintain steady productivity to improve your performance."
      );
    }

    res.json({ recommendations });

  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

/* =====================================================
   AI WEEKLY CHALLENGE (GEMINI API)
===================================================== */
const getWeeklyChallenge = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch tasks for the user
    const tasks = await Task.find({ user: userId });

    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    if (!process.env.GEMINI_API_KEY) {
      // Fallback logic for when GEMINI_API_KEY is not provided
      const currentWeek = Math.ceil(((new Date() - new Date(new Date().getFullYear(),0,1))/86400000 + 1)/7);
      
      const fallbacks = [
        { title: "Task Crusher", description: `Complete ${Math.max(3, pending.length)} tasks this week to clear your backlog based on your ${tasks.length} total tasks.`, target: Math.max(3, pending.length), unit: "tasks", type: "productivity" },
        { title: "Deep Focus", description: "Maintain 2 hours of deep focus each day this week.", target: 14, unit: "hours", type: "focus" },
        { title: "Stay Hydrated", description: "Drink 2.5L Water Daily to maintain essential focus.", target: 7, unit: "days", type: "health" },
        { title: "Active Break", description: "Take a 15-minute walk after completing your daily tasks.", target: 7, unit: "days", type: "fitness" },
        { title: "Early Bird", description: "Complete your first high-priority task before 10 AM.", target: 5, unit: "days", type: "productivity" }
      ];
      
      let fallbackChallenge;
      if (pending.length > 5) {
          fallbackChallenge = fallbacks[0];
      } else {
          const index = currentWeek % fallbacks.length;
          fallbackChallenge = fallbacks[index];
      }
      
      return res.json(fallbackChallenge);
    }

    const taskSummary = `
User has ${tasks.length} total tasks.
Completed tasks (${completed.length}): ${completed.map((t) => t.title).slice(0, 10).join(", ") || "none"}.
Pending tasks (${pending.length}): ${pending.map((t) => t.title).slice(0, 10).join(", ") || "none"}.
    `.trim();

    const prompt = `You are a personal productivity and wellness coach inside a Smart Life Scheduler app.
Based on the user's task data below, generate ONE specific, achievable weekly health & productivity challenge for them.
The challenge should be directly inspired by their actual tasks and patterns.
Do not use markdown blocks for JSON. Output ONLY raw JSON block. It MUST be valid JSON, no trailing commas.

${taskSummary}

Respond ONLY with valid JSON, no markdown, no explanation. Use this exact format:
{
  "title": "Short challenge title (max 6 words)",
  "description": "One sentence explaining why this challenge fits their tasks",
  "target": 7,
  "unit": "days",
  "type": "health"
}
Note: "type" can be ONE of these exact string values: "health", "productivity", "focus", or "fitness".`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up response text to ensure it's parseable JSON
    const cleanJson = responseText.replace(/```json|```/gi, "").trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", cleanJson);
      // Fallback
      parsedResult = {
        title: "Stay Hydrated",
        description: "Drink 2.5L Water Daily to maintain essential focus based on your task load.",
        target: 7,
        unit: "days",
        type: "health"
      };
    }

    res.json(parsedResult);

  } catch (error) {
    console.error("WEEKLY CHALLENGE ERROR:", error);
    res.status(500).json({ message: "Failed to generate weekly challenge." });
  }
};

module.exports = {
  runIntelligence,
  getSummary,
  getProductivity,
  getRecommendations,
  getWeeklyChallenge,
};
