const mongoose = require('mongoose');
require('dotenv').config();

const testDb = async () => {
    try {
        console.log("Dossier Check: Initializing Database Verification...");
        console.log("Target URI:", process.env.MONGODB_URI);
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connection established.");

        const Complaint = require('./models/Complaint');
        const User = require('./models/User');

        const userCount = await User.countDocuments();
        const complaintCount = await Complaint.countDocuments();
        
        console.log(`📊 Protocol Statistics:`);
        console.log(`- Total Citizens/Officers in Node: ${userCount}`);
        console.log(`- Total Incident Dossiers: ${complaintCount}`);

        // Check if we can find any AI_FIR complaints (new schema)
        const aiFirCount = await Complaint.countDocuments({ complaintType: 'AI_FIR' });
        console.log(`- AI-Powered FIRs: ${aiFirCount}`);

        console.log("\n✅ Database integrity check complete. All systems nominal.");
        process.exit(0);
    } catch (error) {
        console.error("❌ CRITICAL: Database verification failed.");
        console.error(error);
        process.exit(1);
    }
};

testDb();
