const generateSchedule = async ({ tasks, completedToday, context }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found. Using mock response.");
        return generateMockSchedule(tasks);
    }

    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an intelligent AI Daily Planner. 
      Current Context: Date is ${context.currentDateStr}, Time is ${context.currentTime}.
      
      User Task Data:
      - Uncompleted: ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority || "Medium", date: t.date, time: t.startTime })), null, 2)}
      - Completed Today: ${JSON.stringify(completedToday.map(t => ({ title: t.title })), null, 2)}
      
      Categorization Rules:
      1. COMPLETED: Tasks from 'Completed Today' list.
      2. MISSED: Uncompleted tasks where (date < today) OR (date == today AND time < ${context.currentTime}).
      3. PENDING: Uncompleted tasks where (date == today AND time >= ${context.currentTime}).
      4. FUTURE: Uncompleted tasks where (date > today). IGNORE these in the schedule unless explicitly requested.
      
      Planning Rules:
      1. Create an optimized schedule for Today starting from ${context.currentTime}.
      2. Plan ONLY for the MISSED and PENDING tasks.
      3. CRITICAL: Prioritize Rescheduling MISSED tasks into the earliest available slots.
      4. Add 15-min breaks every 90 mins.
      
      Response Requirements (JSON ONLY):
      {
        "explanation": "INTELLIGENCE REPORT: ... (mention counts of COMPLETED, MISSED, PENDING)",
        "categorizedSchedule": {
          "completed": [{ "title": "..." }],
          "missed": [{ "timeRange": "HH:MM AM/PM - HH:MM AM/PM", "title": "..." }],
          "pending": [{ "timeRange": "HH:MM AM/PM - HH:MM AM/PM", "title": "..." }]
        }
      }
      IMPORTANT: Return ONLY raw JSON. No markdown blocks.
    `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // More robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI Schedule Error:", error);
        return generateMockSchedule(tasks);
    }
};

const generateMockSchedule = (pendingTasks) => {
    return {
        explanation: "INTELLIGENCE REPORT: I've organized your operational flow for the day.",
        categorizedSchedule: {
            completed: [],
            missed: [],
            pending: (pendingTasks || []).map((t, i) => ({
                timeRange: `${String(9 + i).padStart(2, '0')}:00 AM - ${String(10 + i).padStart(2, '0')}:00 AM`,
                title: t.title
            }))
        }
    };
};

module.exports = { generateSchedule };
