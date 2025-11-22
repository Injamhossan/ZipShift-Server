// Manage rider assignments and status updates

const Rider = require('../models/riderModel');
const Parcel = require('../models/parcelModel');
const Notification = require('../services/notificationService');

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
    // FIX: Pass error to global handler
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
    // FIX: Pass error to global handler
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
    // FIX: Pass error to global handler
    next(error);
  }
};

// Update parcel pickup status
exports.updatePickupStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findById(parcelId);
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
    // FIX: Pass error to global handler
    next(error);
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { status } = req.body;

    const parcel = await Parcel.findById(parcelId);
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
    // FIX: Pass error to global handler
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
    // FIX: Pass error to global handler
    next(error);
  }
};