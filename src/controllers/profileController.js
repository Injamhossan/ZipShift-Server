const User = require('../models/userModel');
const { AppError } = require('../middlewares/errorMiddleware');

const ALLOWED_FIELDS = ['name', 'phone', 'company', 'address', 'pickupArea', 'photoURL'];

const Rider = require('../models/riderModel');

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const ALLOWED_FIELDS = ['name', 'phone', 'company', 'address', 'pickupArea', 'vehicleType', 'vehicleNumber', 'licenseNumber', 'photoURL'];
    
    ALLOWED_FIELDS.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      throw new AppError('No valid profile fields provided', 400);
    }

    let updatedUser;
    if (req.user.role === 'rider' || req.user instanceof Rider) {
        updatedUser = await Rider.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        // Ensure role is present
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'rider' };
    } else {
        updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'user' };
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated'
    });
  } catch (error) {
    next(error);
  }
};



