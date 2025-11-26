const Parcel = require('../models/parcelModel');
const { AppError } = require('../middlewares/errorMiddleware');

const buildTrackingPayload = (parcel) => ({
  trackingId: parcel.trackingNumber,
  status: parcel.status,
  hub: {
    name: parcel.currentHub || 'Central Hub',
    address: parcel.warehouse || 'Processing facility',
    eta: parcel.eta || parcel.deliveredAt || null
  },
  eta: parcel.eta || parcel.deliveredAt || null,
  rider: parcel.riderId ? {
    id: parcel.riderId.id,
    name: parcel.riderId.name,
    phone: parcel.riderId.phone
  } : null,
  customer: {
    name: parcel.customerName,
    phone: parcel.customerPhone,
    address: parcel.address
  },
  timeline: parcel.timeline
});

exports.getTrackingInfo = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const parcel = await Parcel.findOne({
      $or: [
        { trackingNumber: trackingId },
        { _id: trackingId }
      ]
    }).populate('riderId', 'name phone');

    if (!parcel) {
      throw new AppError('Tracking ID not found', 404);
    }

    res.json({
      success: true,
      data: buildTrackingPayload(parcel),
      message: 'Tracking data fetched'
    });
  } catch (error) {
    next(error);
  }
};



