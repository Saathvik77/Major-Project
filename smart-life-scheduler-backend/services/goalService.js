const { GoogleGenerativeAI } = require("@google/generative-ai");
const Goal = require("../models/Goal");
const Task = require("../models/Task");

const generateGoalRoadmap = async (userGoal, targetDurationMonths = 3) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found. Using mock goal roadmap.");
        return {
            description: "Mock: Strategic roadmap for " + userGoal,
            roadmap: [
                { title: "Phase 1: Foundation", description: "Set up basic requirements.", targetWeek: 1, status: 'completed' },
                { title: "Phase 2: Intermediate Training", description: "Deep dive into core concepts.", targetWeek: 4, status: 'pending' },
                { title: "Phase 3: Mastery", description: "Advanced applications and projects.", targetWeek: 12, status: 'pending' }
            ],
            initialTasks: [
                { title: "Initial Research for " + userGoal, description: "Spend 1 hour researching resources.", duration: 60, priority: "High" },
                { title: "Setup Environment", description: "Install necessary tools.", duration: 45, priority: "Medium" }
            ]
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an elite Performance Coach and Strategic Planner.
      User Goal: "${userGoal}"
      Target Duration: ${targetDurationMonths} months.

      Task: Break this goal into a high-level roadmap and specific daily tasks for the first week.

      Response Requirements (JSON ONLY):
      {
        "description": "Short strategic summary of the goal",
        "roadmap": [
          { "title": "Phase 1: ...", "description": "...", "targetWeek": 1 },
          { "title": "Phase 2: ...", "description": "...", "targetWeek": 4 }
        ],
        "initialTasks": [
          { "title": "...", "description": "...", "duration": 60, "priority": "High" }
        ]
      }
      IMPORTANT: Return ONLY raw JSON. No markdown blocks.
    `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];

        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Goal Roadmap Generation Error:", error);
        throw error;
    }
};

const createGoalFromAI = async (userId, goalText) => {
    const aiResponse = await generateGoalRoadmap(goalText);
    
    const goal = new Goal({
        user: userId,
        title: goalText,
        description: aiResponse.description,
        roadmap: aiResponse.roadmap,
    });

    const savedGoal = await goal.save();

    // Create initial tasks
    const tasks = await Promise.all(aiResponse.initialTasks.map(async (taskData) => {
        const task = new Task({
            user: userId,
            title: taskData.title,
            description: taskData.description,
            duration: taskData.duration,
            priority: taskData.priority,
            date: new Date(), // Start today
            status: 'Pending'
        });
        return await task.save();
    }));

    savedGoal.tasks = tasks.map(t => t._id);
    await savedGoal.save();

    return savedGoal;
};

module.exports = {
    generateGoalRoadmap,
    createGoalFromAI
};
