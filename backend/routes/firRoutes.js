const express = require('express');
const { generateFIR, getFIRById, downloadFIRPdf } = require('../controllers/firController');
const { protect, officer } = require('../middlewares/authMiddleware');

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes to avoid shadowing
router.post('/generate/:complaintId', protect, generateFIR);
router.get('/download/:complaintId', protect, downloadFIRPdf);
router.get('/:complaintId', protect, getFIRById);

module.exports = router;
