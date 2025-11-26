const authController = require('../controllers/authController');
const User = require('../models/userModel');
const Rider = require('../models/riderModel');

// Mock Request and Response
const mockReq = (body, auth) => ({
  body,
  auth: { firebase: auth },
  user: null // Simulate new user
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

User.create = async (data) => {
  console.log('Mock User.create called with:', data);
  return { _id: 'mock-user-id', ...data };
};

Rider.create = async (data) => {
  console.log('Mock Rider.create called with:', data);
  return { _id: 'mock-rider-id', ...data };
};

async function runTests() {
  console.log('🧪 Starting Auth Controller Tests...');

  try {
    // Test 1: Register as User (Merchant)
    console.log('\nTest 1: Register as User (Merchant)');
    const req1 = mockReq(
      { role: 'user', company: 'Test Co' },
      { uid: 'firebase-uid-1', email: 'test@user.com' }
    );
    const res1 = mockRes();
    await authController.register(req1, res1);
    
    if (res1.statusCode === 200 && res1.data.data.user.role === 'user') {
      console.log('✅ Test 1 Passed: User created');
    } else {
      console.error('❌ Test 1 Failed:', res1.data);
    }

    // Test 2: Register as Rider
    console.log('\nTest 2: Register as Rider');
    const req2 = mockReq(
      { 
        role: 'rider', 
        vehicleNumber: 'DHAKA-123', 
        licenseNumber: 'LIC-456',
        vehicleType: 'bike'
      },
      { uid: 'firebase-uid-2', email: 'rider@user.com' }
    );
    const res2 = mockRes();
    await authController.register(req2, res2);

    if (res2.statusCode === 200 && res2.data.data.user.vehicleNumber === 'DHAKA-123') {
      console.log('✅ Test 2 Passed: Rider created');
    } else {
      console.error('❌ Test 2 Failed:', res2.data);
    }

    // Test 3: Register as Rider (Missing Fields)
    console.log('\nTest 3: Register as Rider (Missing Fields)');
    const req3 = mockReq(
      { role: 'rider' },
      { uid: 'firebase-uid-3' }
    );
    const res3 = mockRes();
    await authController.register(req3, res3);

    if (res3.statusCode === 400) {
      console.log('✅ Test 3 Passed: Validation error returned');
    } else {
      console.error('❌ Test 3 Failed:', res3.data);
    }

  } catch (err) {
    console.error('❌ Unexpected Error:', err);
  } finally {
    // Restore mocks (not strictly necessary for this script but good practice)
    User.create = originalUserCreate;
    Rider.create = originalRiderCreate;
  }
}

runTests();
