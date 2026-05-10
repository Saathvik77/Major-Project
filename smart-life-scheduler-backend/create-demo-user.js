const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'demo@example.com';
        const password = 'password123';
        
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Demo user already exists');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name: 'Demo User',
                email,
                password: hashedPassword,
            });
            console.log('Demo user created: demo@example.com / password123');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

createTestUser();
