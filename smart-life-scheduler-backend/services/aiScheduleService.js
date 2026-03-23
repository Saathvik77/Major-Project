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
      1. "explanation": A 2-3 sentence overview. Mentions completed tasks as "milestones achieved", specifically highlights how you handled the ${missed.length} missed tasks, and summarizes the new flow.
      2. "schedule": An array of objects: { "timeRange": "HH:MM AM/PM - HH:MM AM/PM", "title": "Task Name" }. 
      
      Return ONLY a JSON object without markdown blocks.
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
