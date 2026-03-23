const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateSchedule = async ({ pending, missed, completed }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found. Using mock response.");
        return generateMockSchedule(pending);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an intelligent AI Daily Planner. You need to organize the user's day based on their current task matrix.
      
      User Matrix:
      - Completed Today: ${completed.length} tasks (Acknowledge these as operational successes)
      - Missed Tasks (OVERDUE): ${missed.length} tasks (These are critical and missed their original slots. Prioritize rescheduling them!)
      - Pending Tasks: ${pending.length} tasks (Upcoming scheduled operations)
      
      Rules for Planning:
      1. Create a realistic, optimized daily schedule starting from 09:00 AM (or the current time if it's later).
      2. Plan ONLY for the Missed and Pending tasks. 
      3. CRITICAL: Reschedule Missed tasks into the earliest available slots.
      4. Place High priority tasks (from Missed or Pending) in peak focus windows.
      5. Add 15-minute breaks after every 60-90 minutes of work.
      6. Assume 45-60 minutes per task unless specified.
      7. End the day by 22:00 max.
      
      Pending Tasks Data:
      ${JSON.stringify(pending.map(t => ({ title: t.title, priority: t.priority || "Medium", description: t.description })), null, 2)}
      
      Missed Tasks Data (Needs Rescheduling):
      ${JSON.stringify(missed.map(t => ({ title: t.title, priority: t.priority || "Medium", description: t.description })), null, 2)}
      
      Response Requirements:
      Return a JSON object with:
      1. "explanation": A detailed breakdown starting with "INTELLIGENCE REPORT:". 
      2. "categorizedSchedule": {
          "completed": [{ "title": "..." }],
          "missed": [{ "timeRange": "...", "title": "..." }],
          "pending": [{ "timeRange": "...", "title": "..." }]
      }
      
      Return ONLY a JSON object without markdown blocks.
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
        return generateMockSchedule(pending);
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
