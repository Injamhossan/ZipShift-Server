// Handle parcel creation, payment status, delivery assignment

const Parcel = require('../models/parcelModel');
const Payment = require('../services/paymentService');
const Notification = require('../services/notificationService');

// Create a new parcel
exports.createParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.create(req.body);
    res.status(201).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { paymentStatus } = req.body;

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Process payment
    const paymentResult = await Payment.processPayment(parcel, paymentStatus);
    
    parcel.paymentStatus = paymentStatus;
    await parcel.save();

    // Send notification
    await Notification.sendNotification(parcel.userId, 'Payment status updated', parcel);

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Assign delivery to rider
exports.assignDelivery = async (req, res, next) => {
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

    parcel.riderId = riderId;
    parcel.status = 'assigned';
    await parcel.save();

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

// Get parcel by ID
exports.getParcel = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const parcel = await Parcel.findById(parcelId).populate('userId riderId');
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: parcel
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Get all parcels
exports.getAllParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find().populate('userId riderId');
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