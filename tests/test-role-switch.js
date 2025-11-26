const authController = require('../controllers/authController');
const User = require('../models/userModel');
const Rider = require('../models/riderModel');

// Mock Request and Response
const mockReq = (body, auth, user) => ({
  body,
  auth: { firebase: auth },
  user: user // Simulate existing user
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

// Mock Models
const originalUserCreate = User.create;
const originalRiderCreate = Rider.create;
const originalUserFindByIdAndDelete = User.findByIdAndDelete;
const originalRiderFindByIdAndDelete = Rider.findByIdAndDelete;

User.create = async (data) => {
  console.log('Mock User.create called');
  return { _id: 'new-user-id', ...data, role: 'user' };
};

Rider.create = async (data) => {
  console.log('Mock Rider.create called');
  return { _id: 'new-rider-id', ...data }; // Riders don't have role field usually, but controller checks instance
};

User.findByIdAndDelete = async (id) => {
  console.log('Mock User.findByIdAndDelete called for:', id);
  return true;
};

Rider.findByIdAndDelete = async (id) => {
  console.log('Mock Rider.findByIdAndDelete called for:', id);
  return true;
};

async function runTests() {
  console.log('🧪 Starting Role Switch Tests...');

  try {
    // Test 1: Switch from User to Rider
    console.log('\nTest 1: Switch from User to Rider');
    const existingUser = new User({
      _id: 'existing-user-id',
      name: 'Old User',
      email: 'test@user.com',
      role: 'user'
    });
    // Mock instanceof check (tricky in mock, but we can rely on property check or just trust the logic if we can't mock instanceof easily without real mongoose objects)
    // Actually, since we are using real models but mocking methods, instanceof should work if we create instance with new User()
    
    const req1 = mockReq(
      { 
        role: 'rider', 
        vehicleNumber: 'DHAKA-123', 
        licenseNumber: 'LIC-456',
        vehicleType: 'bike'
      },
      { uid: 'firebase-uid-1', email: 'test@user.com' },
      existingUser
    );
    const res1 = mockRes();
    
    await authController.register(req1, res1);
    
    if (res1.statusCode === 200 && res1.data.data.role === 'rider') {
      console.log('✅ Test 1 Passed: Switched to Rider');
    } else {
      console.error('❌ Test 1 Failed:', res1.data);
    }

  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  } finally {
    // Restore mocks
    User.create = originalUserCreate;
    Rider.create = originalRiderCreate;
    User.findByIdAndDelete = originalUserFindByIdAndDelete;
    Rider.findByIdAndDelete = originalRiderFindByIdAndDelete;
  }
}

runTests();
