const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const run = async () => {
  await connectDB();
  
  const officers = await User.find({ role: 'OFFICER' });
  console.log(`Found ${officers.length} officers. Resyncing active_cases_count...`);

  for (let officer of officers) {
    const activeCases = await Complaint.countDocuments({
      assignedOfficerUserId: officer._id,
      status: { $in: ['Assigned', 'Investigation Ongoing'] }
    });
    
    officer.active_cases_count = activeCases;
    await officer.save();
    console.log(`Updated officer ${officer.name} - Active Cases: ${activeCases}`);
  }

  console.log('Done!');
  process.exit();
};

run().catch(console.error);
