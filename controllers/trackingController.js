const Tracking = require('../models/trackingModel');
const Parcel = require('../models/parcelModel');
const { AppError } = require('../middlewares/errorMiddleware');

// Get tracking info by tracking ID (public or private)
exports.getTrackingInfo = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const parcel = await Parcel.findOne({ trackingNumber: trackingId })
      .populate('userId', 'name')
      .populate('pickupRiderId', 'name phone')
      .populate('deliveryRiderId', 'name phone');

    if (!parcel) {
      throw new AppError('Parcel not found', 404);
    }

    const history = await Tracking.find({ parcelId: parcel._id }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        parcel: {
            trackingId: parcel.trackingNumber,
            status: parcel.status,
            sender: parcel.senderInfo.name,
            receiver: parcel.receiverInfo.name,
            currentLocation: history[0]?.location || '',
            lastUpdate: history[0]?.timestamp || parcel.updatedAt
        },
        history
      }
    });
  } catch (error) {
    next(error);
  }
};

// Internal helper to create tracking update
exports.createTrackingUpdate = async (parcelId, status, message, location = '') => {
    try {
        await Tracking.create({
            parcelId,
            status,
            message,
            location
        });
    } catch (error) {
        console.error('Failed to create tracking update:', error);
    }
};
