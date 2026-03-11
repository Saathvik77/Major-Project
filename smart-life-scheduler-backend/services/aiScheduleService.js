const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateSchedule = async (tasks) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found. Using mock response.");
        return generateMockSchedule(tasks);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an intelligent AI Daily Planner. The user has ${tasks.length} pending task(s) they need to accomplish.
      Create a realistic, optimized daily schedule starting from 09:00.
      
      Rules:
      - Place High priority tasks first (morning peak energy)
      - Place Medium priority tasks mid-day
      - Place Low priority tasks in the afternoon
      - Add 15-minute breaks after every 60 minutes of work
      - Assume 45-60 minutes per task unless a duration is specified
      - End the day by 20:00 max
      
      Tasks (with priority):
      ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority || "Medium", description: t.description, duration: t.duration })), null, 2)}
      
      Write a 2-3 sentence 'explanation' that tells the user:
      1. How many tasks you scheduled
      2. Why you ordered them the way you did (mention High/Medium/Low priorities specifically)
      3. How breaks were placed
      
      Return ONLY a JSON object with this exact format, without markdown blocks (\`\`\`json):
      {
        "explanation": "I scheduled X tasks for your day. High priority tasks like '...' are placed first in the morning when your energy is highest. Breaks are added after each major block to maintain focus throughout the day.",
        "schedule": [
          { "timeRange": "09:00 - 10:00", "title": "Task Name" },
          { "timeRange": "10:00 - 10:15", "title": "Break" }
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI Schedule Error:", error);
        return generateMockSchedule(tasks);
    }
};

const generateMockSchedule = (tasks) => {
    const schedule = [];
    let currentHour = 9;
    let currentMinute = 0;

    if (!tasks || tasks.length === 0) {
        return {
            explanation: "I created a basic daily structure since there are no pending tasks.",
            schedule: [
                { timeRange: "09:00 - 10:00", title: "Review goals for the day" },
                { timeRange: "10:00 - 10:15", title: "Break" },
                { timeRange: "10:15 - 11:30", title: "Deep Work Session" }
            ]
        };
    }

    const formatTime = (h, m) => `${h.toString().padStart(2, '0')}`;

    tasks.forEach((task, index) => {
        let nextHour = currentHour + 1;
        let nextMinute = currentMinute;

        schedule.push({
            timeRange: `${formatTime(currentHour, currentMinute)} - ${formatTime(nextHour, nextMinute)}`,
            title: task.title
        });

        currentHour = nextHour;
        currentMinute = nextMinute;

        // Add a 15 min break after every task
        let breakEndHour = currentHour;
        let breakEndMinute = currentMinute + 15;
        if (breakEndMinute >= 60) {
            breakEndHour++;
            breakEndMinute -= 60;
        }

        schedule.push({
            timeRange: `${formatTime(currentHour, currentMinute)} - ${formatTime(breakEndHour, breakEndMinute)}`,
            title: "Break"
        });

        currentHour = breakEndHour;
        currentMinute = breakEndMinute;
    });

    return {
        explanation: "This schedule spaces out your tasks evenly while ensuring you take a 15-minute break after each task to maintain focus.",
        schedule
    };
};

module.exports = { generateSchedule };
