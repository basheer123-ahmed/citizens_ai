const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
const Department = require('./backend/models/Department');
const Complaint = require('./backend/models/Complaint');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to MongoDB');

    // Clean existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Complaint.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@city.gov',
      password: 'password123',
      role: 'ADMIN',
      phone: '1234567890'
    });

    // Create Departments
    const dept1 = await Department.create({
      name: 'PWD (Public Works Department)',
      categoriesHandled: ['Potholes', 'Other']
    });

    const dept2 = await Department.create({
      name: 'Sanitation Department',
      categoriesHandled: ['Garbage Overflow', 'Water Leakage']
    });

    // Create Officers
    // (Removed dummy officers John and Sarah)

    // Create Citizen
    const citizen = await User.create({
      name: 'Alex Citizen',
      email: 'alex@gmail.com',
      password: 'password123',
      role: 'CITIZEN',
      phone: '5554443332'
    });

    // Create some sample complaints
    await Complaint.create([
      {
        complaintId: 'COMP-001',
        citizenUserId: citizen._id,
        category: 'Potholes',
        description: 'Large pothole on 4th cross road near Metro station. Dangerous for bikers.',
        latitude: 28.6139, 
        longitude: 77.2090, 
        address: 'Delhi Metro Station',
        status: 'Assigned',
        priority: 'High',
        assignedDepartmentId: dept1._id,
        statusHistory: [{ status: 'Submitted' }, { status: 'Under Review' }, { status: 'Assigned' }]
      },
      {
        complaintId: 'COMP-002',
        citizenUserId: citizen._id,
        category: 'Garbage Overflow',
        description: 'Garbage not picked up for 3 days in Block B area.',
        latitude: 28.6145, 
        longitude: 77.2085, 
        address: 'Block B Residential',
        status: 'Submitted',
        priority: 'Medium',
        statusHistory: [{ status: 'Submitted' }]
      }
    ]);

    console.log('Seed: Database Populated Successfully');
    process.exit();
  } catch (error) {
    console.error('Seed: Error', error);
    process.exit(1);
  }
};

seedData();
