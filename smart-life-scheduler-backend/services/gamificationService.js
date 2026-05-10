const User = require("../models/User");

const addXP = async (userId, amount) => {
    const user = await User.findById(userId);
    if (!user) return null;

    user.xp += amount;
    
    // Level up logic (e.g., each level requires 1000 XP)
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
        user.level = newLevel;
        // Logic for unlocking badges could go here
    }

    await user.save();
    return { xp: user.xp, level: user.level };
};

const getDailyMissions = async (userId) => {
    // In a real app, these would be generated based on user behavior
    return [
        { title: "Complete 5 tasks", reward: 50, progress: 60, id: 'm1' },
        { title: "Walk 6000 steps", reward: 30, progress: 45, id: 'm2' },
        { title: "Focus 2 hours", reward: 100, progress: 80, id: 'm3' }
    ];
};

module.exports = {
    addXP,
    getDailyMissions
};
