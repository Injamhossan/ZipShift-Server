// Handle parcel creation, payment status, delivery assignment

const Parcel = require('../models/parcelModel');
const Rider = require('../models/riderModel');
const Payment = require('../services/paymentService');
const Notification = require('../services/notificationService');
const Billing = require('../models/billingModel');
const { AppError } = require('../middlewares/errorMiddleware');

const sanitizeParcel = (parcelDoc) => ({
  id: parcelDoc.id,
  trackingId: parcelDoc.trackingNumber,
  senderInfo: parcelDoc.senderInfo,
  receiverInfo: parcelDoc.receiverInfo,
  parcelType: parcelDoc.parcelType,
  weight: parcelDoc.weight,
  cost: parcelDoc.cost,
  status: parcelDoc.status,
  paymentStatus: parcelDoc.paymentStatus,
  pickupRiderId: parcelDoc.pickupRiderId,
  deliveryRiderId: parcelDoc.deliveryRiderId,
  createdAt: parcelDoc.createdAt,
  updatedAt: parcelDoc.updatedAt
});

// Create a new parcel
exports.createParcel = async (req, res, next) => {
  try {
    const {
      senderInfo,
      receiverInfo,
      parcelType,
      weight,
      cost
    } = req.body;

    if (!senderInfo || !receiverInfo || !cost) {
      throw new AppError('Sender info, receiver info, and cost are required', 400);
    }

    const parcelPayload = {
      userId: req.user._id,
      senderInfo,
      receiverInfo,
      parcelType,
      weight,
      cost,
      status: 'unpaid'
    };

    const parcel = await Parcel.create(parcelPayload);

    res.status(201).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Parcel created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { paymentStatus } = req.body;

    const parcel = await Parcel.findOne({ _id: parcelId });
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    // Process payment logic here if needed (e.g., verify with Stripe)
    // For now, just update the status
    
    parcel.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
        parcel.status = 'paid'; // Move to paid status
    }
    await parcel.save();

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Payment status updated'
    });
  } catch (error) {
    next(error);
  }
};

// Assign rider (Pickup or Delivery)
exports.assignRider = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const { riderId, type } = req.body; // type: 'pickup' or 'delivery'

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
        throw new AppError('Rider not found', 404);
    }

    if (type === 'pickup') {
        parcel.pickupRiderId = riderId;
        parcel.status = 'ready-to-pickup';
    } else if (type === 'delivery') {
        parcel.deliveryRiderId = riderId;
        parcel.status = 'ready-for-delivery';
    } else {
        throw new AppError('Invalid assignment type', 400);
    }

    await parcel.save();

    // Notify rider
    // await Notification.sendNotification(riderId, 'New task assigned', parcel);

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Rider assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update Parcel Status
exports.updateParcelStatus = async (req, res, next) => {
    try {
        const { parcelId } = req.params;
        const { status } = req.body;

        const parcel = await Parcel.findById(parcelId);
        if (!parcel) {
            throw new AppError('Parcel not found', 404);
        }

        // Add validation logic for status transitions if needed
        parcel.status = status;
        
        // If delivered, update deliveredAt
        if (status === 'delivered') {
            // Update rider earnings
            if (parcel.deliveryRiderId) {
                await Rider.findByIdAndUpdate(parcel.deliveryRiderId, { $inc: { earnings: 20, totalDeliveries: 1 } });
            }
        } else if (status === 'in-transit' || status === 'reached-service-center') {
             if (parcel.pickupRiderId && status === 'in-transit') {
                 // Maybe update pickup rider earnings here if they dropped it off?
                 // Requirement says: "Rider Earning will be increased by 20" on pickup confirm.
                 // Pickup confirm -> status 'in-transit' (if diff centers) or 'ready-for-delivery' (if same)
                  await Rider.findByIdAndUpdate(parcel.pickupRiderId, { $inc: { earnings: 20, totalDeliveries: 1 } });
             }
        }

        await parcel.save();

        res.status(200).json({
            success: true,
            data: sanitizeParcel(parcel),
            message: 'Parcel status updated'
        });

    } catch (error) {
        next(error);
    }
};

// Get parcel by ID
exports.getParcel = async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    let query = { _id: parcelId };

    // If user is not admin, ensure they own the parcel or are assigned to it
    if (req.user.role === 'user') {
        query.userId = req.user._id;
    } else if (req.user.role === 'rider') {
        // Rider can see if assigned
        query.$or = [{ pickupRiderId: req.user._id }, { deliveryRiderId: req.user._id }];
    }

    const parcel = await Parcel.findOne(query)
      .populate('userId pickupRiderId deliveryRiderId');
    
    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    res.status(200).json({
      success: true,
      data: sanitizeParcel(parcel),
      message: 'Parcel fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all parcels
exports.getAllParcels = async (req, res, next) => {
  try {
    const {
      status = 'all',
      page = 1,
      limit = 10,
      search
    } = req.query;

    let filters = {};

    // Role-based filtering
    if (req.user.role === 'user') {
        filters.userId = req.user._id;
    } else if (req.user.role === 'rider') {
        filters.$or = [{ pickupRiderId: req.user._id }, { deliveryRiderId: req.user._id }];
    }
    // Admin sees all by default

    if (status !== 'all') {
      filters.status = status;
    }

    if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus;
    }

    if (search) {
        filters.$or = [
            { 'senderInfo.contact': { $regex: search, $options: 'i' } },
            { 'receiverInfo.contact': { $regex: search, $options: 'i' } },
            { trackingNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);

    const [parcels, total] = await Promise.all([
      Parcel.find(filters)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .populate('userId pickupRiderId deliveryRiderId'),
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
    next(error);
  }
};