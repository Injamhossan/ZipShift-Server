const express = require('express');
const router = express.Router();
const { createSupportTicket } = require('../controllers/supportController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/tickets', protect, createSupportTicket);

module.exports = router;



