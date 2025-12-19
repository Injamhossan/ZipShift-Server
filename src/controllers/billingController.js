const Billing = require('../models/billingModel');

const ensureBillingDoc = async (userId) => {
  const existing = await Billing.findOne({ userId });
  if (existing) {
    return existing;
  }

  return Billing.create({
    userId,
    walletBalance: 0,
    pendingCod: 0,
    lastPayout: null,
    payouts: []
  });
};

exports.getBillingOverview = async (req, res, next) => {
  try {
    const billing = await ensureBillingDoc(req.user._id);

    res.json({
      success: true,
      data: {
        walletBalance: billing.walletBalance,
        pendingCod: billing.pendingCod,
        lastPayout: billing.lastPayout,
        payouts: billing.payouts
      },
      message: 'Billing overview fetched'
    });
  } catch (error) {
    next(error);
  }
};



