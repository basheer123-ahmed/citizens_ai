const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/citizen_grievance_portal');
  
  const complaints = await Complaint.find();
  console.log('=== COMPLAINTS ===');
  for (const c of complaints) {
    console.log(`${c.complaintId} | STATUS: ${c.status} | RATING: ${c.rating || 'none'} | OFFICER: ${c.assignedOfficerUserId}`);
    
    // Auto-fix any complaints that were stuck because the old backend didn't update status
    if (c.status === 'Feedback Pending') {
        c.status = 'Resolved';
        await c.save();
        console.log(`  [FIXED] Updated ${c.complaintId} from Feedback Pending -> Resolved`);
    }
  }

  console.log('\n=== USERS ===');
  const officers = await User.find({ role: 'OFFICER' });
  for (const o of officers) {
     console.log(`[OFFICER] ${o.name} | ID: ${o._id}`);
  }

  process.exit(0);
}
run();
