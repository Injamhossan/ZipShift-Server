const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware'); // Assuming we have auth middleware

// Apply auth middleware to protect routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

module.exports = router;
