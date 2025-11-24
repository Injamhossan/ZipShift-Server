// Handle parcel creation, payment status, delivery assignment

const Parcel = require('../models/parcelModel');
const Payment = require('../services/paymentService');
const Notification = require('../services/notificationService');
const Billing = require('../models/billingModel');
const { AppError } = require('../middlewares/errorMiddleware');
const { emitSocketEvent } = require('../services/socketService');
const { buildDashboardSummary } = require('./dashboardController');

const buildTimelineSeed = (pickupArea) => ([
  {
    label: 'Pickup scheduled',
    status: 'Pending',
    done: true,
    location: pickupArea || 'Warehouse',
    time: new Date()
  },
  {
    label: 'Parcel in transit',
    status: 'On the way',
    done: false,
    location: 'Sorting facility',
    time: new Date()
  },
  {
    label: 'Out for delivery',
    status: 'On the way',
    done: false,
    location: 'Destination hub',
    time: new Date()
  },
  {
    label: 'Delivered',
    status: 'Delivered',
    done: false,
    location: 'Recipient address',
    time: new Date()
  }
]);

const sanitizeParcel = (parcelDoc) => ({
  id: parcelDoc.id,
  trackingId: parcelDoc.trackingNumber,
  customerName: parcelDoc.customerName,
  customerPhone: parcelDoc.customerPhone,
  address: parcelDoc.address,
  weight: parcelDoc.weight,
  cod: parcelDoc.codAmount || 0,
  status: parcelDoc.status,
  timeline: parcelDoc.timeline,
  createdAt: parcelDoc.createdAt,
  updatedAt: parcelDoc.updatedAt
});

// Create a new parcel
exports.createParcel = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      address,
      weight,
      cod = 0,
      note = '',
      pickupArea = ''
    } = req.body;

    if (!customerName || !customerPhone || !address || !weight) {
      throw new AppError('customerName, customerPhone, address and weight are required', 400);
    }

    const parcelPayload = {
      userId: req.user._id,
      customerName,
      customerPhone,
      address,
      weight,
      codAmount: cod,
      note,
      pickupArea,
      status: 'Pending',
      timeline: buildTimelineSeed(pickupArea),
      senderName: req.user.name,
      senderPhone: req.user.phone || '',
      senderAddress: req.user.address || '',
      recipientName: customerName,
      recipientPhone: customerPhone,
      recipientAddress: address,
      city: pickupArea || req.user.city || ''
    };

    const parcel = await Parcel.create(parcelPayload);

    const billingSnapshot = await Billing.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { pendingCod: cod || 0 },
        $setOnInsert: {
          walletBalance: 0,
          lastPayout: {
            amount: 0
          }
        }
      },
      { upsert: true, new: true }
    );

    emitSocketEvent('parcels:created', sanitizeParcel(parcel), req.auth?.firebase?.uid);
    emitSocketEvent(
      'billing:payout',
      {
        walletBalance: billingSnapshot.walletBalance,
        pendingCod: billingSnapshot.pendingCod,
        lastPayout: billingSnapshot.lastPayout,
        payouts: billingSnapshot.payouts
      },
      req.auth?.firebase?.uid
    );

    const summary = await buildDashboardSummary(req.user._id);
    emitSocketEvent('dashboard:summary', summary, req.auth?.firebase?.uid);

    res.status(201).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Parcel created successfully'
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

    const parcel = await Parcel.findOne({ _id: parcelId, userId: req.user._id });
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    // Process payment
    const paymentResult = await Payment.processPayment(parcel, paymentStatus);
    
    parcel.paymentStatus = paymentStatus;
    await parcel.save();

    // Send notification
    await Notification.sendNotification(parcel.userId, 'Payment status updated', parcel);

    emitSocketEvent('parcels:updated', sanitizeParcel(parcel), req.auth?.firebase?.uid);

    const summary = await buildDashboardSummary(req.user._id);
    emitSocketEvent('dashboard:summary', summary, req.auth?.firebase?.uid);

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Payment status updated'
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

    const parcel = await Parcel.findOne({ _id: parcelId, userId: req.user._id });
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    parcel.riderId = riderId;
    parcel.status = 'On the way';
    await parcel.save();

    // Notify rider
    await Notification.sendNotification(riderId, 'New delivery assigned', parcel);

    emitSocketEvent('parcels:updated', sanitizeParcel(parcel));

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Delivery assignment updated'
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
    const parcel = await Parcel.findOne({ _id: parcelId, userId: req.user._id })
      .populate('userId riderId');
    
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Parcel fetched successfully'
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};

// Get all parcels
exports.getAllParcels = async (req, res, next) => {
  try {
    const {
      status = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const filters = { userId: req.user._id };
    if (status !== 'all') {
      filters.status = status;
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);

    const [parcels, total] = await Promise.all([
      Parcel.find(filters)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
      Parcel.countDocuments(filters)
    ]);

    res.status(200).json({
      success: true,
      data: {
        results: parcels.map(sanitizeParcel),
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(total / parsedLimit)
        }
      },
      message: 'Parcels fetched successfully'
    });
  } catch (error) {
    // FIX: Pass error to global handler
    next(error);
  }
};