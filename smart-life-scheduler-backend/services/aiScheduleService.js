const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateSchedule = async (tasks) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found. Using mock response.");
        return generateMockSchedule(tasks);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an intelligent AI Daily Planner. The user has ${tasks.length} total task(s) in their operational log.
      Create a realistic, optimized daily schedule starting from 09:00.
      
      Rules:
      - Organize ALL provided tasks into a chronological flow for the day.
      - Place High priority tasks first (morning peak energy)
      - Place Medium priority tasks mid-day
      - Place Low priority tasks in the afternoon
      - If a task is already marked as completed (if info is available), still include it in the schedule at its completed/intended time to show a full day's work.
      - Add 15-minute breaks after every 60 minutes of work
      - Assume 45-60 minutes per task unless a duration is specified
      - End the day by 22:00 max
      
      Tasks (with status and priority):
      ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority || "Medium", completed: t.completed, startTime: t.startTime })), null, 2)}
      
      Write a 2-3 sentence 'explanation' that tells the user:
      1. How many tasks you scheduled
      2. Why you ordered them the way you did (mention High/Medium/Low priorities specifically)
      3. How breaks were placed
      
      Return ONLY a JSON object with this exact format, without markdown blocks (\`\`\`json):
      {
        "explanation": "I scheduled X tasks for your day. High priority tasks like '...' are placed first in the morning when your energy is highest. Breaks are added after each major block to maintain focus throughout the day.",
        "schedule": [
          { "timeRange": "09:00 AM - 10:00 AM", "title": "Task Name" },
          { "timeRange": "10:00 AM - 10:15 AM", "title": "Break" }
        ]
      }
      IMPORTANT: All times in the timeRange MUST use 12-hour format with AM/PM (e.g., 09:00 AM, 02:30 PM).
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
                { timeRange: "09:00 AM - 10:00 AM", title: "Review goals for the day" },
                { timeRange: "10:00 AM - 10:15 AM", title: "Break" },
                { timeRange: "10:15 AM - 11:30 AM", title: "Deep Work Session" }
            ]
        };
    }

    const formatTime12h = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    tasks.forEach((task, index) => {
        let nextHour = currentHour + 1;
        let nextMinute = currentMinute;

        schedule.push({
            timeRange: `${formatTime12h(currentHour, currentMinute)} - ${formatTime12h(nextHour, nextMinute)}`,
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
            timeRange: `${formatTime12h(currentHour, currentMinute)} - ${formatTime12h(breakEndHour, breakEndMinute)}`,
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
