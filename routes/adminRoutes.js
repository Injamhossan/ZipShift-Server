// Routes for admin actions

const express = require('express');
const router = express.Router();
const {
  assignRider,
  getAllParcels,
  getAllRiders,
  updateWarehouse,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Parcel management
router.get('/parcels', getAllParcels);
router.put('/parcels/:parcelId/assign-rider', assignRider);
router.put('/parcels/:parcelId/warehouse', updateWarehouse);

// Rider management
router.get('/riders', getAllRiders);

module.exports = router;

