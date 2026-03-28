const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Department = require('./models/Department');

async function checkData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/citizen_grievance_portal');
  
  const userCount = await User.countDocuments();
  const officerCount = await User.countDocuments({ role: 'OFFICER' });
  const complaintCount = await Complaint.countDocuments();
  const departmentCount = await Department.countDocuments();
  
  const officers = await User.find({ role: 'OFFICER' });
  const officersList = officers.map(o => o.name);

  console.log('--- DATABASE STATS ---');
  console.log(`Users: ${userCount}`);
  console.log(`Officers: ${officerCount} (${officersList.join(', ')})`);
  console.log(`Complaints: ${complaintCount}`);
  console.log(`Departments: ${departmentCount}`);

  if (complaintCount > 0) {
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n--- COMPLAINT STATUSES ---');
    console.log(statusCounts);
  }

  process.exit(0);
}
checkData();
