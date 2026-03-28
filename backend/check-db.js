const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citizen_grievance_portal');
        console.log('Connected to MongoDB');

        const officerCount = await User.countDocuments({ role: 'OFFICER' });
        const adminCount = await User.countDocuments({ role: 'ADMIN' });
        const citizenCount = await User.countDocuments({ role: 'CITIZEN' });
        const deptCount = await Department.countDocuments();

        console.log(`Users: officers=${officerCount}, admins=${adminCount}, citizens=${citizenCount}`);
        console.log(`Departments: ${deptCount}`);

        const officers = await User.find({ role: 'OFFICER' }).populate('departmentId');
        console.log('Officers:', officers.map(o => ({ 
            name: o.name, 
            dept: o.departmentId ? o.departmentId.name : 'NONE' 
        })));

        const depts = await Department.find();
        console.log('Departments List:', depts.map(d => d.name));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkData();
