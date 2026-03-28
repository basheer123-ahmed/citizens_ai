const Complaint = require('../models/Complaint');

// @desc    Get dashboard metrics for an officer
// @route   GET /api/officers/dashboard-stats
// @access  Private (Officer)
const getDashboardStats = async (req, res) => {
  try {
    const officerId = req.user._id;

    const complaints = await Complaint.find({ assignedOfficerUserId: officerId });

    const totalAssigned = complaints.length;
    const completed = complaints.filter(c => ['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(c.status)).length;
    
    // Average rating
    const ratedComplaints = complaints.filter(c => c.rating);
    const averageRating = ratedComplaints.length > 0 
      ? (ratedComplaints.reduce((acc, curr) => acc + curr.rating, 0) / ratedComplaints.length).toFixed(1)
      : 0;

    res.json({
      totalAssigned,
      completed,
      averageRating: parseFloat(averageRating),
      pending: totalAssigned - completed,
      analytics: {
         statusDistribution: {
           Submitted: complaints.filter(c=>c.status==='Submitted').length,
           Assigned: complaints.filter(c=>c.status==='Assigned to Responsible Department Officer').length,
           InProgress: complaints.filter(c=>c.status==='Work In Progress').length,
           Completed: completed
         }
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
