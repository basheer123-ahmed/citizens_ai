const express = require('express');
const { 
  assignComplaint, 
  getDashboardAnalytics, 
  getOfficers,
  updateOfficerDepartment,
  attachFIR
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/assign/:id', protect, admin, assignComplaint);
router.get('/analytics', protect, admin, getDashboardAnalytics);
router.get('/officers', protect, admin, getOfficers);
router.put('/officer/:id/department', protect, admin, updateOfficerDepartment);
router.put('/fir/:id', protect, admin, attachFIR);

module.exports = router;
