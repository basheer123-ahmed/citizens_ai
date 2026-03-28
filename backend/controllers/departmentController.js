const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('officerUserIds', 'name email');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
  const { name, categoriesHandled } = req.body;
  console.log('Incoming Department Creation:', { name, categoriesHandled });

  try {
    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
      console.warn('Department creation failed: Name already exists:', name);
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      categoriesHandled
    });

    console.log('Department created successfully:', department._id);
    res.status(201).json(department);
  } catch (error) {
    console.error('CRITICAL: Department Creation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Safety cleanup: Update all users (officers) belonging to this department
    const User = require('../models/User'); // Import here to avoid circular dependency if any
    await User.updateMany(
      { departmentId: department._id },
      { $set: { departmentId: null } }
    );

    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: 'Department decommissioned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDepartments, createDepartment, deleteDepartment };
