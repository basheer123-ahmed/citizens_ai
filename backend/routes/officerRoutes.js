const express = require('express');
const { getDashboardStats } = require('../controllers/officerController');
const { protect, officer } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard-stats', protect, officer, getDashboardStats);

module.exports = router;
