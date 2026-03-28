const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const listUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
        await mongoose.connect(mongoUri);
        const users = await User.find({}, 'email role');
        users.forEach(u => console.log(`${u.email} : ${u.role}`));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
listUsers();
