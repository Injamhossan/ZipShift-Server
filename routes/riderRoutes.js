// Routes for rider actions (pickup, delivery)

const express = require('express');
const router = express.Router();
const {
  getAllRiders,
  getRider,
  updateAvailability,
  updatePickupStatus,
  updateDeliveryStatus,
  getRiderParcels
} = require('../controllers/riderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes (for testing)
router.get('/', getAllRiders);
router.get('/:riderId', getRider);

// Get rider's assigned parcels
router.get('/:riderId/parcels', protect, authorize('rider'), getRiderParcels);

// Update rider availability
router.put('/:riderId/availability', protect, authorize('rider'), updateAvailability);

// Update pickup status
router.put('/parcels/:parcelId/pickup', protect, authorize('rider'), updatePickupStatus);

// Update delivery status
router.put('/parcels/:parcelId/delivery', protect, authorize('rider'), updateDeliveryStatus);

module.exports = router;

