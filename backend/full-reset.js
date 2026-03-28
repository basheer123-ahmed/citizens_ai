const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const performReset = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
    await mongoose.connect(mongoUri);
    console.log('--- POLICE SYSTEM INITIALIZATION START ---');

    console.log('1. Purging existing municipal complaints...');
    await Complaint.deleteMany({});

    console.log('2. Decommissioning municipal accounts (including stale admins/citizens)...');
    await User.deleteMany({});

    console.log('3. Decommissioning municipal departments...');
    await Department.deleteMany({});

    console.log('4. Initializing Police Division Structure...');
    const divisions = [
      { name: 'Crime Division', categories: ['Theft', 'Assault', 'Missing Person'] },
      { name: 'Cyber Crime Cell', categories: ['Online Fraud', 'Hacking', 'Identity Theft'] },
      { name: 'Traffic Control Unit', categories: ['Accident', 'Traffic Violation', 'Speeding'] },
      { name: 'Women & Child Safety Unit', categories: ['Harassment / Threat', 'Domestic Violence', 'Child Abuse'] },
      { name: 'Intelligence & Surveillance Unit', categories: ['Suspicious Activity', 'Espionage'] },
      { name: 'Patrol Unit', categories: ['Noise Complaint', 'Public Nuisance', 'Loitering'] }
    ];

    for (const div of divisions) {
      await Department.create({
        name: div.name,
        categoriesHandled: div.categories
      });
      console.log(`Initialized Division: ${div.name}`);
    }

    // Ensure Admin & Citizen (Alex) exist
    const usersToCreate = [
      { name: 'Super Admin', email: 'admin@city.gov', password: 'password123', role: 'ADMIN', phone: '1234567890', dob: new Date('1980-01-01') },
      { name: 'Citizen Admin', email: 'admin@citizen.care', password: 'password123', role: 'ADMIN', phone: '1234567891', dob: new Date('1985-01-01') },
      { name: 'Historical Admin', email: 'dd3340065@gmail.com', password: 'password123', role: 'ADMIN', phone: '1234567892', dob: new Date('1990-01-01') },
      { name: 'Alex Citizen', email: 'alex@gmail.com', password: 'password123', role: 'CITIZEN', phone: '5554443332', dob: new Date('2000-01-01') },
      { name: 'Historical Citizen', email: 'abhinaykamagonda@gmail.com', password: 'password123', role: 'CITIZEN', phone: '5554443333', dob: new Date('1995-01-01') },
      { name: 'Mokshith Officer', email: 'mokshithkr@gmail.com', password: 'password123', role: 'OFFICER', phone: '9876543210', dob: new Date('1992-01-01'), officerId: 'OFF-1234', rank: 'Sub-Inspector (SI)' }
    ];

    for (const u of usersToCreate) {
      try {
        await User.create(u);
        console.log(`Initialized Account: ${u.email} (${u.role})`);
      } catch (err) {
        console.error(`FAILED to create account ${u.email}:`, err.message);
      }
    }

    console.log('--- POLICE SYSTEM INITIALIZATION COMPLETE ---');
    process.exit();
  } catch (error) {
    console.error('Reset: Error', error);
    process.exit(1);
  }
};

performReset();
