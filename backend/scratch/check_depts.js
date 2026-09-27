const mongoose = require('mongoose');
require('dotenv').config();

const DepartmentSchema = new mongoose.Schema({}, { strict: false });
const Department = mongoose.model('Department', DepartmentSchema);

const checkDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const depts = await Department.find();
        console.log("Departments found:", depts.length);
        console.log(JSON.stringify(depts, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDepartments();
