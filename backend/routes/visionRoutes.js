const express = require('express');
const { verifyImage, translateVoiceText, verifyCompletionProof } = require('../controllers/visionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/verify', protect, verifyImage);
router.post('/translate', protect, translateVoiceText);
router.post('/verify-completion', protect, verifyCompletionProof);

module.exports = router;
