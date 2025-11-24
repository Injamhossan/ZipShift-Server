const express = require('express');
const router = express.Router();
const { getBillingOverview } = require('../controllers/billingController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getBillingOverview);

module.exports = router;

