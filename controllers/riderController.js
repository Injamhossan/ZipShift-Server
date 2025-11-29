// Manage rider assignments and status updates

const Rider = require('../models/riderModel');
const Parcel = require('../models/parcelModel');
const Notification = require('../services/notificationService');
const { getDashboardSummary } = require('./dashboardController');
const { buildDashboardSummary } = require('./dashboardController');

const formatParcelEvent = (parcel) => ({
  id: parcel.id,
  trackingId: parcel.trackingNumber,
  status: parcel.status,
  timeline: parcel.timeline,
  customerName: parcel.customerName,
  address: parcel.address,
  cod: parcel.codAmount || 0,
  updatedAt: parcel.updatedAt
});

// Get all riders
exports.getAllRiders = async (req, res, next) => {
  try {
    const riders = await Rider.find();
    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders
    });
  } catch (error) {
    next(error);
  }
};

// Get rider by ID
exports.getRider = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const rider = await Rider.findById(riderId).populate('assignedParcels');
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rider
    });
  } catch (error) {
    next(error);
  }
};

// Update rider availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const { isAvailable } = req.body;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    rider.isAvailable = isAvailable;
    await rider.save();

    res.status(200).json({
      success: true,
      data: rider
    });
  } catch (error) {
    next(error);
  }
};

// Update parcel pickup status
exports.updatePickupStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findById(parcelId).populate('userId', 'firebaseUid');
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    parcel.status = status;
    await parcel.save();

    // Notify user
    await Notification.sendNotification(parcel.userId, `Parcel ${status}`, parcel);

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findById(parcelId).populate('userId', 'firebaseUid');
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    parcel.status = status;
    if (status === 'delivered') {
      parcel.deliveredAt = new Date();
    }
    await parcel.save();

    // Notify user
    await Notification.sendNotification(parcel.userId, `Parcel ${status}`, parcel);

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// Get rider's assigned parcels
exports.getRiderParcels = async (req, res, next) => {
  try {
    const { riderId } = req.params;
    const parcels = await Parcel.find({ riderId, status: { $ne: 'delivered' } });
    
    res.status(200).json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};