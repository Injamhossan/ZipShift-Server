const User = require('../models/userModel');
const { AppError } = require('../middlewares/errorMiddleware');

const ALLOWED_FIELDS = ['name', 'phone', 'company', 'address', 'pickupArea'];

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      throw new AppError('No valid profile fields provided', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated'
    });
  } catch (error) {
    next(error);
  }
};



