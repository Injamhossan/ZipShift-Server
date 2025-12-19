const User = require('../models/userModel');
const Rider = require('../models/riderModel');

// @desc    Register a new user (update profile after Firebase auth)
// @route   POST /api/auth/register
// @access  Private
exports.register = async (req, res) => {
  try {
    console.log('📝 Auth Controller: Register called');
    console.log('📦 Request Body:', req.body);

    // The user might be already created (if we kept auto-creation, but we removed it)
    // Or req.user is null if it's a new registration
    let user = req.user;
    const { role, company, address, city, pickupArea, vehicleType, vehicleNumber, licenseNumber, name, email, phone } = req.body;
    const firebaseAuth = req.auth.firebase;

    if (!user) {
      // New User Registration
      console.log('🆕 Creating new user profile for role:', role);
      
      const commonData = {
        firebaseUid: firebaseAuth.uid,
        name: name || firebaseAuth.name || 'New User',
        email: email || firebaseAuth.email || `${firebaseAuth.uid}@zipshift.app`,
        phone: phone || firebaseAuth.phone_number || null
      };

      if (role === 'rider') {
        // Validate required rider fields
        if (!vehicleNumber || !licenseNumber) {
           return res.status(400).json({
             success: false,
             message: 'Vehicle number and license number are required for riders'
           });
        }

        user = await Rider.create({
          ...commonData,
          vehicleType: vehicleType || 'bike',
          vehicleNumber,
          licenseNumber
        });
      } else {
        // Default to User (Merchant)
        user = await User.create({
          ...commonData,
          role: 'user', // Force role to user/merchant
          company,
          address,
          city,
          pickupArea,
          authProvider: 'firebase'
        });
      }
      console.log('✨ New profile created:', user._id);
    } else {
      // Update existing profile
      console.log('📝 Updating existing profile:', user._id);
      
      // Check for role switch
      const isRider = user instanceof Rider;
      const requestedRole = role;

      if (requestedRole === 'rider' && !isRider) {
        console.log('🔄 Switching from User to Rider...');
        // Delete User and create Rider
        await User.findByIdAndDelete(user._id);
        
        if (!vehicleNumber || !licenseNumber) {
           return res.status(400).json({
             success: false,
             message: 'Vehicle number and license number are required for riders'
           });
        }

        user = await Rider.create({
          firebaseUid: firebaseAuth.uid,
          name: name || user.name,
          email: email || user.email,
          phone: phone || user.phone,
          vehicleType: vehicleType || 'bike',
          vehicleNumber,
          licenseNumber
        });
        console.log('✨ Switched to Rider profile:', user._id);

      } else if (requestedRole === 'user' && isRider) {
        console.log('🔄 Switching from Rider to User...');
        // Delete Rider and create User
        await Rider.findByIdAndDelete(user._id);

        user = await User.create({
          firebaseUid: firebaseAuth.uid,
          name: name || user.name,
          email: email || user.email,
          phone: phone || user.phone,
          role: 'user',
          company,
          address,
          city,
          pickupArea,
          authProvider: 'firebase'
        });
        console.log('✨ Switched to User profile:', user._id);

      } else {
        // Normal Update (Same Role)
        if (user.role === 'rider' || (role === 'rider' && user instanceof Rider)) {
           // Update Rider specific fields
           if (vehicleType) user.vehicleType = vehicleType;
           if (vehicleNumber) user.vehicleNumber = vehicleNumber;
           if (licenseNumber) user.licenseNumber = licenseNumber;
        } else {
          // Update User specific fields
          if (company) user.company = company;
          if (address) user.address = address;
          if (city) user.city = city;
          if (pickupArea) user.pickupArea = pickupArea;
        }
        
        // Common updates
        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();
      }
    }

    // Ensure role is present in the response object for frontend consistency
    const finalRole = user.role || (user instanceof Rider ? 'rider' : 'user');
    const userResponse = user.toObject ? user.toObject() : user;
    userResponse.role = finalRole;

    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        role: finalRole
      }
    });
  } catch (error) {
    console.error('❌ Auth Controller Register Error:', error.message);
    
    // Handle Duplicate Key Errors (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Account with this ${field} already exists.`,
        error: `Duplicate ${field}`
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: 'Validation Error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message,
      error: error.message
    });
  }
};

// @desc    Login user (return profile)
// @route   POST /api/auth/login
// @access  Private
exports.login = async (req, res) => {
  try {
    console.log('🔓 Auth Controller: Login called');
    // The user is already attached to req by authMiddleware
    const user = req.user;
    
    if (!user) {
      console.log('❌ User not found in DB during login');
      return res.status(404).json({
        success: false,
        message: 'User not registered',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log('👤 User logged in:', user._id);

    // Update last login if you want to track it (optional)
    // user.lastLogin = Date.now();
    // await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('❌ Auth Controller Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure role is present
    const finalRole = user.role || (user.vehicleNumber ? 'rider' : 'user');
    const userResponse = user.toObject ? user.toObject() : user;
    userResponse.role = finalRole;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        role: finalRole
      }
    });
  } catch (error) {
    console.error('❌ Auth Controller GetCurrentUser Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
