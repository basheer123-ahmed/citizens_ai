const mongoose = require('mongoose');
const User = require('./backend/models/User');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const listUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_grievance_portal';
    await mongoose.connect(mongoUri);
    const users = await User.find({}, 'name email role');
    console.log(JSON.stringify(users, null, 2));
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
listUsers();
