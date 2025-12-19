const Parcel = require('../models/parcelModel');
const Billing = require('../models/billingModel');

const DELIVERED_STATES = ['Delivered', 'delivered'];
const PENDING_STATES = ['Pending', 'pending', 'assigned'];

const buildDashboardSummary = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalShipments,
    pendingPickups,
    deliveredLast30Days,
    deliveredTotal,
    billing,
    recentParcels
  ] = await Promise.all([
    Parcel.countDocuments({ userId }),
    Parcel.countDocuments({ userId, status: { $in: PENDING_STATES } }),
    Parcel.countDocuments({
      userId,
      status: { $in: DELIVERED_STATES },
      deliveredAt: { $gte: thirtyDaysAgo }
    }),
    Parcel.countDocuments({ userId, status: { $in: DELIVERED_STATES } }),
    Billing.findOne({ userId }),
    Parcel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('trackingNumber status codAmount createdAt')
  ]);

  const completionRate = totalShipments
    ? Math.round((deliveredTotal / totalShipments) * 100)
    : 0;

  return {
    summary: {
      totalShipments,
      pendingPickups,
      deliveredLast30Days,
      completionRate
    },
    billing: {
      walletBalance: billing?.walletBalance || 0,
      pendingCod: billing?.pendingCod || 0,
      lastPayout: billing?.lastPayout || null
    },
    recentParcels: recentParcels.map((parcel) => ({
      trackingId: parcel.trackingNumber,
      status: parcel.status,
      cod: parcel.codAmount,
      createdAt: parcel.createdAt
    }))
  };
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await buildDashboardSummary(req.user._id);
    res.json({
      success: true,
      data: summary,
      message: 'Dashboard summary fetched'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  buildDashboardSummary
};

