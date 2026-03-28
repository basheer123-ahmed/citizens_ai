const express = require('express');
const { handleChat } = require('../controllers/chatController');

const { softProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', softProtect, handleChat);

module.exports = router;
