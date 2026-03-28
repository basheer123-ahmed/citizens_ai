const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getHotspots,
  getMyComplaints,
  rateComplaint,
  getAssignedComplaints,
  submitGeneralFeedback,
  getGeneralFeedbacks,
  analyzeComplaint,
  voiceChat
} = require('../controllers/complaintController');
const { protect, officer, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createComplaint)
  .get(protect, getComplaints);

router.get('/my', protect, getMyComplaints);
router.get('/assigned', protect, officer, getAssignedComplaints);
router.get('/hotspots', protect, admin, getHotspots);
router.put('/:id/rate', protect, rateComplaint);
router.post('/platform-feedback', protect, submitGeneralFeedback);
router.get('/platform-feedback', protect, getGeneralFeedbacks);
router.post('/analyze-complaint', protect, analyzeComplaint);
router.post('/voice-chat', protect, voiceChat);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, updateComplaintStatus);

module.exports = router;
