const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('--- REPAIR SEEDING START ---');
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('CONNECTED TO ATLAS SUCCESSFUL.');

    // Only create the user the user is trying to log in with
    const testUser = await User.findOne({ email: 'dd3340065@gmail.com' });
    if (!testUser) {
        await User.create({
            name: 'Hackathon Admin',
            email: 'dd3340065@gmail.com',
            phone: '778899001122',
            password: 'password123',
            role: 'ADMIN',
            dob: new Date('1990-01-01')
        });
        console.log('User dd3340065@gmail.com created as ADMIN.');
    } else {
        console.log('User dd3340065@gmail.com already exists.');
    }

    // Also seed departments if missing
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
        await Department.insertMany([
            { name: 'PWD', categoriesHandled: ['Potholes', 'Roads'] },
            { name: 'Sanitation', categoriesHandled: ['Garbage', 'Sewage'] }
        ]);
        console.log('Departments seeded.');
    }

    console.log('--- REPAIR SEEDING COMPLETE ---');
    process.exit();
  } catch (err) {
    console.error('REPAIR FAILED:', err.message);
    process.exit(1);
  }
};
seed();
