// Routes for parcel creation, payment, tracking

const express = require('express');
const router = express.Router();
const {
  createParcel,
  updatePaymentStatus,
  assignDelivery,
  getParcel,
  getAllParcels
} = require('../controllers/parcelController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes (for testing - remove protect for now)
router.get('/', getAllParcels);
router.get('/:parcelId', getParcel);

// Protected routes (add protect later when auth is implemented)
router.post('/', createParcel);
router.put('/:parcelId/payment', protect, updatePaymentStatus);
router.put('/:parcelId/assign', protect, assignDelivery);

module.exports = router;

