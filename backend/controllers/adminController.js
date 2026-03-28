const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Assign complaint to department/officer
// @route   PUT /api/admin/assign/:id
// @access  Private (Admin)
const assignComplaint = async (req, res) => {
  const { departmentId, officerId } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const oldOfficerId = complaint.assignedOfficerUserId;
    if (oldOfficerId && oldOfficerId.toString() !== officerId) {
       await User.findByIdAndUpdate(oldOfficerId, { $inc: { active_cases_count: -1 } });
    }
    if (!oldOfficerId || oldOfficerId.toString() !== officerId) {
       await User.findByIdAndUpdate(officerId, { $inc: { active_cases_count: 1 } });
    }

    complaint.assignedDepartmentId = departmentId;
    complaint.assignedOfficerUserId = officerId;
    complaint.status = 'Assigned';
    complaint.statusHistory.push({
      status: 'Assigned',
      remarks: 'Mission deployed to designated Tactical Personnel.'
    });

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getDashboardAnalytics = async (req, res) => {
  try {
    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const categoryCountsArr = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryCounts = categoryCountsArr.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Last 7 days activity
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyCounts = await Complaint.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const activityData = last7Days.map(date => {
      const dayData = dailyCounts.find(d => d._id === date);
      return dayData ? dayData.count : 0;
    });

    // Average resolution time
    const resolvedComplaints = await Complaint.find({ status: { $in: ['Resolved', 'Closed'] } });
    const avgResTime = resolvedComplaints.length > 0 
      ? resolvedComplaints.reduce((acc, comp) => acc + (new Date(comp.updatedAt) - new Date(comp.createdAt)), 0) / resolvedComplaints.length / (1000 * 60 * 60) 
      : 0;

    const departments = await Department.find();
    const departmentData = departments.map(d => ({
      _id: d._id,
      name: d.name,
      categories: d.categoriesHandled,
      officerCount: d.officerUserIds.length
    }));

    const ratingStats = await Complaint.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, globalAvgRating: { $avg: '$rating' } } }
    ]);

    // Officer Performance
    const officers = await User.find({ role: 'OFFICER' }).select('name rank');
    const officerPerformance = await Promise.all(officers.map(async (officer) => {
      const stats = await Complaint.aggregate([
        { $match: { assignedOfficerUserId: officer._id } },
        { $group: {
            _id: '$status',
            count: { $sum: 1 }
        }}
      ]);
      
      const ratingData = await Complaint.aggregate([
        { $match: { assignedOfficerUserId: officer._id, rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      const counts = stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      return {
        _id: officer._id,
        name: officer.name,
        rank: officer.rank || 'CONSTABLE',
        assigned: (counts['Assigned'] || counts['Submitted'] || 0),
        resolved: (counts['Completed'] || 0) + (counts['Feedback Pending'] || 0) + (counts['Resolved'] || 0) + (counts['Closed'] || 0),
        inProgress: (counts['Investigation Ongoing'] || 0) + (counts['Evidence Secured'] || 0),
        avgRating: ratingData[0]?.avgRating ? Math.round(ratingData[0].avgRating * 10) / 10 : 0
      };
    }));

    res.json({
      statusCounts,
      categoryCounts,
      activityData,
      activityLabels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
      avgResTime: Math.round(avgResTime * 10) / 10,
      departments: departmentData,
      globalAvgRating: ratingStats[0]?.globalAvgRating ? Math.round(ratingStats[0].globalAvgRating * 10) / 10 : 0,
      officerPerformance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all officers
// @route   GET /api/admin/officers
// @access  Private (Admin)
const getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'OFFICER' })
      .select('name email departmentId rank active_cases_count availability_status')
      .populate('departmentId', 'name')
      .lean();

    // Map through officers and add complaint stats
    const officersWithStats = await Promise.all(officers.map(async (officer) => {
      const stats = await Complaint.aggregate([
        { $match: { assignedOfficerUserId: officer._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            resolvedCount: {
              $sum: { $cond: [{ $in: ['$status', ['Completed', 'Feedback Pending', 'Resolved', 'Closed']] }, 1, 0] }
            }
          }
        }
      ]);

      return {
        ...officer,
        performance: {
          avgRating: stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0,
          resolvedCount: stats[0]?.resolvedCount || 0
        }
      };
    }));

    res.json(officersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update officer department
// @route   PUT /api/admin/officer/:id/department
// @access  Private (Admin)
const updateOfficerDepartment = async (req, res) => {
  const { departmentId } = req.body;

  try {
    const officer = await User.findById(req.params.id);

    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    if (officer.role !== 'OFFICER') return res.status(400).json({ message: 'User is not an officer' });

    // Update the officer's departmentId
    const oldDeptId = officer.departmentId;
    officer.departmentId = departmentId;
    await officer.save();

    // Update the Department collections' officer list
    if (oldDeptId) {
      await Department.findByIdAndUpdate(oldDeptId, { $pull: { officerUserIds: officer._id } });
    }
    if (departmentId) {
      await Department.findByIdAndUpdate(departmentId, { $addToSet: { officerUserIds: officer._id } });
    }

    res.json({ message: 'Officer department updated successfully', officer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Attach AI-generated FIR to complaint
// @route   PUT /api/admin/fir/:id
// @access  Private (Admin)
const attachFIR = async (req, res) => {
  const { firData } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.firData = {
      ...firData,
      generatedAt: new Date()
    };
    
    complaint.statusHistory.push({
      status: complaint.status,
      remarks: 'Automated AI Executive FIR generated and attached to case dossier.',
      updatedBy: req.user._id
    });

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { assignComplaint, getDashboardAnalytics, getOfficers, updateOfficerDepartment, attachFIR };
