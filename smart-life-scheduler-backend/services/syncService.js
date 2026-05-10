const { google } = require('googleapis');
const Task = require('../models/Task');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const parseEmailForTasks = async (emailContent) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Analyze the following email content and detect if there are any meetings, deadlines, or tasks mentioned.
      Email: "${emailContent}"

      Response Requirements (JSON ONLY):
      {
        "tasks": [
          { "title": "...", "description": "...", "startTime": "HH:MM AM/PM", "date": "YYYY-MM-DD", "type": "meeting|task" }
        ]
      }
      If no tasks found, return {"tasks": []}.
      IMPORTANT: Return ONLY raw JSON. No markdown blocks.
    `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        return JSON.parse(text);
    } catch (error) {
        console.error("Email parsing error:", error);
        return { tasks: [] };
    }
};

const syncGoogleCalendar = async (userId, auth) => {
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) return [];

    const tasks = await Promise.all(events.map(async (event) => {
        const start = event.start.dateTime || event.start.date;
        const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = new Date(start).toISOString().split('T')[0];

        // Check if task already exists
        const existing = await Task.findOne({ user: userId, title: event.summary, date });
        if (existing) return existing;

        const task = new Task({
            user: userId,
            title: event.summary,
            description: event.description || "Synced from Google Calendar",
            date,
            startTime,
            status: 'Pending',
            priority: 'High'
        });

        // "Meeting detected → auto block prep time"
        const prepTimeTask = new Task({
            user: userId,
            title: `Prep for ${event.summary}`,
            description: "Automatically scheduled preparation time.",
            date,
            startTime: new Date(new Date(start).getTime() - 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: 30,
            status: 'Pending',
            priority: 'Medium'
        });

        await prepTimeTask.save();
        return await task.save();
    }));

    return tasks;
};

const syncFitnessData = async (userId, auth) => {
    const fitness = google.fitness({ version: 'v1', auth });
    
    // In a real implementation, we would fetch data sources and aggregates.
    // Here we'll simulate the fetch and update the user model.
    // For demonstration, we'll update with some realistic mock data if auth is present.
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return null;

    // Simulate automatic update from "phone sensors"
    user.healthData.steps += Math.floor(Math.random() * 500);
    user.healthData.lastActive = new Date();
    
    await user.save();
    return user.healthData;
};

module.exports = {
    parseEmailForTasks,
    syncGoogleCalendar,
    syncFitnessData
};
