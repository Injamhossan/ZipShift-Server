const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getStats);

module.exports = router;
