// Admin actions: assign riders, manage warehouses

const Parcel = require('../models/parcelModel');
const Rider = require('../models/riderModel');
const Notification = require('../services/notificationService');

// Assign rider to parcel
exports.assignRider = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { riderId } = req.body;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    if (!rider.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Rider is not available'
      });
    }

    parcel.riderId = riderId;
    parcel.status = 'assigned';
    await parcel.save();

    // Add to rider's assigned parcels
    rider.assignedParcels.push(parcelId);
    await rider.save();

    // Notify rider
    await Notification.sendNotification(riderId, 'New delivery assigned', parcel);

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Get all parcels (admin view)
exports.getAllParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find()
      .populate('userId', 'name email phone')
      .populate('riderId', 'name phone')
      .sort({ createdAt: -1 });

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

// Get all riders (admin view)
exports.getAllRiders = async (req, res, next) => {
  try {
    const riders = await Rider.find()
      .populate('assignedParcels')
      .sort({ createdAt: -1 });

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

// Update warehouse information
exports.updateWarehouse = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { warehouse } = req.body;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    parcel.warehouse = warehouse;
    await parcel.save();

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalParcels = await Parcel.countDocuments();
    const pendingParcels = await Parcel.countDocuments({ status: 'pending' });
    const inTransitParcels = await Parcel.countDocuments({ status: 'in-transit' });
    const deliveredParcels = await Parcel.countDocuments({ status: 'delivered' });
    const totalRiders = await Rider.countDocuments();
    const availableRiders = await Rider.countDocuments({ isAvailable: true });

    res.status(200).json({
      success: true,
      data: {
        parcels: {
          total: totalParcels,
          pending: pendingParcels,
          inTransit: inTransitParcels,
          delivered: deliveredParcels
        },
        riders: {
          total: totalRiders,
          available: availableRiders
        }
      }
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};