const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const resetPassword = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
        await mongoose.connect(mongoUri);
        const users = await User.find({});
        for (let user of users) {
            user.password = 'password123';
            if (!user.dob) user.dob = new Date('1990-01-01');
            if (!user.phone) user.phone = '1234567890';
            if (!user.name) user.name = 'User';
            await user.save();
            console.log(`Reset password for ${user.email}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
resetPassword();
