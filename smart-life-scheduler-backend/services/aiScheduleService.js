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
      You are an AI Daily Planner. Given the following list of pending tasks for today, 
      create a realistic schedule from 09:00 to 18:00 (or later if needed).
      Consider priorities and typical task durations (assume 30-60 mins unless specified).
      Include breaks.
      
      Tasks:
      ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, description: t.description })), null, 2)}
      
      Return ONLY a JSON array with the following format, and nothing else (no markdown blocks like \`\`\`json):
      [
        { "timeRange": "09:00 - 10:00", "title": "Task Name" },
        { "timeRange": "10:00 - 10:15", "title": "Break" }
      ]
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
        return [
            { timeRange: "09:00 - 10:00", title: "Review goals for the day" },
            { timeRange: "10:00 - 10:15", title: "Break" },
            { timeRange: "10:15 - 11:30", title: "Deep Work Session" }
        ];
    }

    const formatTime = (h, m) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

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

    return schedule;
};

module.exports = { generateSchedule };
