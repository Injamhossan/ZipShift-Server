const Parcel = require('../models/parcelModel');
const User = require('../models/userModel');
const Rider = require('../models/riderModel');
const { AppError } = require('../middlewares/errorMiddleware');

exports.getStats = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let stats = {};

    if (role === 'user') {
      // User Stats
      const parcels = await Parcel.find({ userId: _id });
      
      const statusCounts = parcels.reduce((acc, parcel) => {
        acc[parcel.status] = (acc[parcel.status] || 0) + 1;
        return acc;
      }, {});

      stats = {
        totalParcels: parcels.length,
        statusCounts
      };

    } else if (role === 'admin') {
      // Admin Stats
      const [
        totalUsers,
        totalRiders,
        totalParcels,
        deliveredParcels,
        totalEarnings // Mock calculation or sum of payments
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Rider.countDocuments(),
        Parcel.countDocuments(),
        Parcel.countDocuments({ status: 'delivered' }),
        Parcel.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ])
      ]);

      stats = {
        totalUsers,
        totalRiders,
        totalParcels,
        deliveredParcels,
        totalEarnings: totalEarnings[0]?.total || 0
      };

    } else if (role === 'rider') {
      // Rider Stats
      const rider = await Rider.findOne({ email: req.user.email }); // Assuming rider is linked by email or use _id if Rider model uses same _id as User (which it might not, need to check)
      
      // Wait, Rider model has firebaseUid, but req.user comes from authMiddleware which uses User model.
      // If Rider is a separate collection but authenticated via same mechanism, we need to find the Rider document.
      // In `riderModel.js`, it has `email` and `firebaseUid`.
      // In `userModel.js`, it has `role: 'rider'`.
      // So a user with role 'rider' should have a corresponding Rider document? Or is the User document enough?
      // The requirement says "Manage Rider (Admin) ... By clicking approve the Rider status will be approved & user role will be rider".
      // So there is a User document with role 'rider' AND a Rider document?
      // Let's assume we find Rider by email.

      const riderDoc = await Rider.findOne({ email: req.user.email });
      
      if (riderDoc) {
          const parcelsToPickup = await Parcel.countDocuments({ pickupRiderId: riderDoc._id, status: 'ready-to-pickup' });
          const parcelsToDeliver = await Parcel.countDocuments({ deliveryRiderId: riderDoc._id, status: 'ready-for-delivery' });

          stats = {
            earnings: riderDoc.earnings || 0,
            parcelsToPickup,
            parcelsToDeliver,
            totalDeliveries: riderDoc.totalDeliveries
          };
      } else {
          stats = { error: 'Rider profile not found' };
      }
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};
