const mongoose = require('mongoose');

const connectDB = async () => {
    // 1. Get URI and Validate
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ FATAL ERROR: MongoDB connection string is missing.');
        console.error('👉 Ensure MONGO_URI or MONGODB_URI is set in your .env file.');
        process.exit(1);
    }

    // Mask the URI for safe logging (hides password)
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`🔌 Initializing connection to MongoDB Atlas...`);
    console.log(`🔗 URI: ${maskedUri}`);

    try {
        // 2. Strict Atlas Connection
        // Removed local fallback. App will fail fast if Atlas is unreachable.
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of waiting forever
            connectTimeoutMS: 10000 
        });

        console.log(`✅ MongoDB Atlas Connected Successfully!`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
        await autoSeedDatabase();
        
    } catch (error) {
        // 3. Robust Error Debugging & Exit
        console.error('\n' + '='.repeat(50));
        console.error(`🔴 MONGODB ATLAS CONNECTION FAILED`);
        console.error('='.repeat(50));
        
        // Analyze specific common errors
        if (error.message.includes('ECONNREFUSED')) {
            console.error('❌ ERROR TYPE: Network Connection Refused');
            console.error('👉 REASON: Could not reach the MongoDB Atlas server. This is usually due to DNS resolution failure or network block.');
        } else if (error.message.includes('querySrv')) {
            console.error('❌ ERROR TYPE: DNS SRV Lookup Failure');
            console.error('👉 REASON: Cannot resolve the Atlas domain. Often caused by strict ISP DNS rules, VPNs, or blocked standard DNS ports.');
        } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
            console.error('❌ ERROR TYPE: Authentication Failure');
            console.error('👉 REASON: Invalid username or password in the connection string.');
        } else if (error.message.includes('IP address')) {
            console.error('❌ ERROR TYPE: IP Whitelist Rejection');
            console.error('👉 REASON: Your current IP is not allowed to connect to this Atlas cluster.');
        } else {
            console.error(`❌ RAW ERROR: ${error.message}`);
        }

        console.error('\n🔧 --- TROUBLESHOOTING CHECKLIST --- 🔧');
        console.error('1. Atlas Network Access: Ensure your IP is whitelisted (Go to Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere: 0.0.0.0/0).');
        console.error('2. URI Format: Ensure no special characters in your password are unescaped (e.g., @, :, /, # require URL encoding).');
        console.error('3. Internet/DNS: If you get "querySrv" errors, try switching Wi-Fi networks (e.g., mobile hotspot), disabling VPNs, or changing your system DNS to 8.8.8.8.');
        console.error('4. ENV Checking: Ensure your backend reads the .env variables correctly from the root of backend folder.');
        console.error('='.repeat(50) + '\n');
        console.error('\n⚠️ FALLING BACK TO LOCAL MEMORY DATABASE...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            const memoryConn = await mongoose.connect(memoryUri);
            console.log(`✅ Local In-Memory MongoDB Connected Successfully!`);
            console.log(`🌐 Host: ${memoryConn.connection.host}`);
            console.log(`💡 Note: Data will be reset when the server restarts.`);
            await autoSeedDatabase();
        } catch (memError) {
            console.error('❌ Failed to start Memory Server:', memError);
            process.exit(1);
        }
    }
};

async function autoSeedDatabase() {
    try {
        const Department = require('../models/Department');
        const User = require('../models/User');
        
        // Only seed if Admin doesn't exist
        const adminExists = await User.findOne({ email: 'admin@city.gov' });
        if (adminExists) {
            console.log(`✅ Seed accounts already exist in DB.`);
            return;
        }

        const pwd = await Department.create({ name: 'PWD (Public Works Department)', categoriesHandled: ['Potholes', 'Roads', 'Infrastructure Decay', 'Other'] });
        const san = await Department.create({ name: 'Sanitation Department', categoriesHandled: ['Garbage Overflow', 'Sanitation Feed', 'Public Health'] });
        
        await User.create({ name: 'John Citizen', email: 'john1@gmail.com', password: 'password123', role: 'USER', phone: '9999999999', dob: '1990-01-01' });
        await User.create({ name: 'Rupesh Officer', email: 'rupesh@city.gov', password: 'password123', role: 'STAFF', phone: '1111111111', dob: '1990-01-01', departmentId: pwd._id });
        await User.create({ name: 'Admin', email: 'admin@city.gov', password: 'password123', role: 'ADMIN', phone: '2222222222', dob: '1990-01-01' });
        console.log(`✅ Auto-seeded Departments and Staff into DB!`);
    } catch (seedErr) {
        console.error(`❌ Failed to auto-seed:`, seedErr.message);
    }
}

module.exports = connectDB;

