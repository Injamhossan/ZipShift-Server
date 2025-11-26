const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', protect, register);
router.post('/login', protect, login);

module.exports = router;
