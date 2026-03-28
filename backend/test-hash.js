const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

const testCreation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal');
        
        // Clean up first
        await User.deleteOne({ email: 'test_hash@example.com' });

        const newUser = await User.create({
            name: 'Test Hash',
            email: 'test_hash@example.com',
            phone: '1231231234',
            password: 'password123', // plain password text
            role: 'CITIZEN'
        });

        // Test login
        const savedUser = await User.findOne({ email: 'test_hash@example.com' }).select('+password');
        const match = await savedUser.comparePassword('password123');
        console.log(`Registered user match for 'password123': `, match);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testCreation();
