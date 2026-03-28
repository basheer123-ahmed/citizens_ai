const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User.js');

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal');
        
        let output = 'Connected to DB\n';
        const users = await User.find({}).select('+password');
        for (const user of users) {
             output += `User: ${user.email}, Role: ${user.role}, Hash: ${user.password}\n`;
        }
        fs.writeFileSync('c:/Users/K/Desktop/CGMP/backend/users-output2.json', JSON.stringify({text: output}));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
