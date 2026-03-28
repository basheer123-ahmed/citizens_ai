const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to MongoDB');

    // Create Departments
    let dept1 = await Department.findOne({ name: 'PWD (Public Works Department)' });
    if (!dept1) {
      dept1 = await Department.create({
        name: 'PWD (Public Works Department)',
        categoriesHandled: ['Potholes', 'Other']
      });
    }

    let dept2 = await Department.findOne({ name: 'Sanitation Department' });
    if (!dept2) {
      dept2 = await Department.create({
        name: 'Sanitation Department',
        categoriesHandled: ['Garbage Overflow', 'Water Leakage']
      });
    }

    // Create Admin
    if (!await User.findOne({ email: 'admin@city.gov' })) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@city.gov',
        password: 'password123',
        role: 'ADMIN',
        phone: '1234567890',
        dob: '1980-01-01'
      });
    }

    // Removed dummy officers John and Sarah

    // Create Citizen
    let citizen = await User.findOne({ email: 'alex@gmail.com' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Alex Citizen',
        email: 'alex@gmail.com',
        password: 'password123',
        role: 'CITIZEN',
        phone: '5554443332',
        dob: '1995-05-15'
      });
    }

    console.log('Missing seed accounts added to DB Successfully');
    process.exit();
  } catch (error) {
    console.error('Seed: Error', error);
    process.exit(1);
  }
};

seedData();
