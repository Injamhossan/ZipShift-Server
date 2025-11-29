// Routes for parcel creation, payment, tracking

const express = require('express');
const router = express.Router();
const {
  createParcel,
  updatePaymentStatus,
  assignRider,
  updateParcelStatus,
  getParcel,
  getAllParcels
} = require('../controllers/parcelController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getAllParcels);
router.get('/:parcelId', getParcel);
router.post('/', createParcel);
router.put('/:parcelId/payment', updatePaymentStatus);
router.put('/:parcelId/assign', assignRider);
router.put('/:parcelId/status', updateParcelStatus);

module.exports = router;

