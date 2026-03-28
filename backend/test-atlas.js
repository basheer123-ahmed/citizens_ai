const mongoose = require('mongoose');
require('dotenv').config();

const test = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('Testing connection to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log('✅ Connection Successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('--- ERROR DETAILS ---');
        console.error('NAME:', error.name);
        console.error('MESSAGE:', error.message);
        console.error('CODE:', error.code);
        console.error('REASON:', JSON.stringify(error.reason, null, 2));
        console.error('----------------------');
        process.exit(1);
    }
};

test();
