const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', protect, register);
router.post('/login', protect, login);
router.get('/me', protect, getCurrentUser);

module.exports = router;
