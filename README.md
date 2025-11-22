# Delivery Backend API

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zip_shift
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=30d
```

### 3. Start Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

Server will start on: `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Test Endpoints (No Auth Required)
- `GET /api/test` - Test server connection
- `GET /api/health` - Health check

### Parcels API
- `GET /api/parcels` - Get all parcels (No Auth)
- `GET /api/parcels/:parcelId` - Get parcel by ID (No Auth)
- `POST /api/parcels` - Create new parcel (No Auth for testing)
- `PUT /api/parcels/:parcelId/payment` - Update payment (Auth required)
- `PUT /api/parcels/:parcelId/assign` - Assign delivery (Auth required)

### Riders API
- `GET /api/riders` - Get all riders (No Auth)
- `GET /api/riders/:riderId` - Get rider by ID (No Auth)
- `PUT /api/riders/:riderId/availability` - Update availability (Auth required)
- `PUT /api/riders/parcels/:parcelId/pickup` - Update pickup status (Auth required)
- `PUT /api/riders/parcels/:parcelId/delivery` - Update delivery status (Auth required)

### Admin API
- `GET /api/admin/dashboard` - Dashboard stats (Admin Auth required)
- `GET /api/admin/parcels` - All parcels (Admin Auth required)
- `GET /api/admin/riders` - All riders (Admin Auth required)
- `PUT /api/admin/parcels/:parcelId/assign-rider` - Assign rider (Admin Auth required)

## 🌐 Frontend Integration

### Example: Test Connection
```javascript
fetch('http://localhost:5000/api/test')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Example: Get All Parcels
```javascript
fetch('http://localhost:5000/api/parcels')
  .then(res => res.json())
  .then(data => {
    console.log('Parcels:', data.data);
  })
  .catch(err => console.error('Error:', err));
```

### Example: Create Parcel
```javascript
fetch('http://localhost:5000/api/parcels', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-id-here',
    senderName: 'John Doe',
    senderPhone: '1234567890',
    senderAddress: '123 Main St',
    recipientName: 'Jane Smith',
    recipientPhone: '0987654321',
    recipientAddress: '456 Oak Ave',
    city: 'Karachi',
    weight: 2.5,
    description: 'Test parcel'
  })
})
  .then(res => res.json())
  .then(data => console.log('Created:', data))
  .catch(err => console.error('Error:', err));
```

## 🧪 Testing Rider & Admin Functionality

### Step 1: Create Test Users

First, you need to create test users with `admin` and `rider` roles. You can do this using MongoDB directly or via a script.

#### Option A: Using MongoDB Compass or MongoDB Shell

Connect to your database and run these commands:

```javascript
// Create Admin User
db.users.insertOne({
  name: "Admin User",
  email: "admin@test.com",
  phone: "1234567890",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "password123"
  role: "admin",
  paymentStatus: "active",
  isActive: true
});

// Create Rider User
db.users.insertOne({
  name: "Rider User",
  email: "rider@test.com",
  phone: "0987654321",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "password123"
  role: "rider",
  paymentStatus: "active",
  isActive: true
});
```

#### Option B: Using Node.js Script

Create a file `createTestUsers.js` in the root directory:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Rider = require('./models/riderModel');
const bcrypt = require('bcryptjs');

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      phone: '1234567890',
      password: adminPassword,
      role: 'admin',
      paymentStatus: 'active'
    });
    console.log('✅ Admin created:', admin._id);

    // Create Rider User
    const riderPassword = await bcrypt.hash('rider123', 10);
    const riderUser = await User.create({
      name: 'Rider User',
      email: 'rider@test.com',
      phone: '0987654321',
      password: riderPassword,
      role: 'rider',
      paymentStatus: 'active'
    });
    console.log('✅ Rider User created:', riderUser._id);

    // Create Rider Profile
    const rider = await Rider.create({
      name: 'Rider User',
      email: 'rider@test.com',
      phone: '0987654321',
      vehicleType: 'bike',
      vehicleNumber: 'ABC-123',
      licenseNumber: 'LIC-12345',
      isAvailable: true
    });
    console.log('✅ Rider Profile created:', rider._id);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUsers();
```

Run the script:
```bash
node createTestUsers.js
```

### Step 2: Get JWT Token

You'll need to create a login endpoint or use a tool to generate JWT tokens. For testing, you can use this helper script:

```javascript
// generateToken.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/env');

// Replace with actual user ID from database
const userId = 'YOUR_USER_ID_HERE';
const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
console.log('Token:', token);
```

### Step 3: Test Rider Endpoints

#### Get All Riders (Public)
```javascript
fetch('http://localhost:5000/api/riders')
  .then(res => res.json())
  .then(data => {
    console.log('Riders:', data.data);
    // Save riderId for next requests
  });
```

#### Get Rider by ID (Public)
```javascript
fetch('http://localhost:5000/api/riders/RIDER_ID_HERE')
  .then(res => res.json())
  .then(data => console.log('Rider:', data.data));
```

#### Update Rider Availability (Auth Required)
```javascript
fetch('http://localhost:5000/api/riders/RIDER_ID_HERE/availability', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_RIDER_TOKEN_HERE`
  },
  body: JSON.stringify({
    isAvailable: false
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated:', data));
```

#### Get Rider's Assigned Parcels (Auth Required)
```javascript
fetch('http://localhost:5000/api/riders/RIDER_ID_HERE/parcels', {
  headers: {
    'Authorization': `Bearer YOUR_RIDER_TOKEN_HERE`
  }
})
  .then(res => res.json())
  .then(data => console.log('Parcels:', data.data));
```

#### Update Pickup Status (Auth Required)
```javascript
fetch('http://localhost:5000/api/riders/parcels/PARCEL_ID_HERE/pickup', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_RIDER_TOKEN_HERE`
  },
  body: JSON.stringify({
    status: 'picked-up'
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated:', data));
```

#### Update Delivery Status (Auth Required)
```javascript
fetch('http://localhost:5000/api/riders/parcels/PARCEL_ID_HERE/delivery', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_RIDER_TOKEN_HERE`
  },
  body: JSON.stringify({
    status: 'delivered'
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated:', data));
```

### Step 4: Test Admin Endpoints

#### Get Dashboard Stats (Admin Auth Required)
```javascript
fetch('http://localhost:5000/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
  }
})
  .then(res => res.json())
  .then(data => console.log('Dashboard:', data.data));
```

#### Get All Parcels (Admin View)
```javascript
fetch('http://localhost:5000/api/admin/parcels', {
  headers: {
    'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
  }
})
  .then(res => res.json())
  .then(data => console.log('All Parcels:', data.data));
```

#### Get All Riders (Admin View)
```javascript
fetch('http://localhost:5000/api/admin/riders', {
  headers: {
    'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
  }
})
  .then(res => res.json())
  .then(data => console.log('All Riders:', data.data));
```

#### Assign Rider to Parcel (Admin Auth Required)
```javascript
fetch('http://localhost:5000/api/admin/parcels/PARCEL_ID_HERE/assign-rider', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
  },
  body: JSON.stringify({
    riderId: 'RIDER_ID_HERE'
  })
})
  .then(res => res.json())
  .then(data => console.log('Assigned:', data));
```

#### Update Warehouse (Admin Auth Required)
```javascript
fetch('http://localhost:5000/api/admin/parcels/PARCEL_ID_HERE/warehouse', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_ADMIN_TOKEN_HERE`
  },
  body: JSON.stringify({
    warehouse: 'Warehouse-A'
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated:', data));
```

### Step 5: Using Postman for Testing

1. **Create a Collection** named "ZipShift API Tests"

2. **Set Environment Variables**:
   - `base_url`: `http://localhost:5000/api`
   - `admin_token`: Your admin JWT token
   - `rider_token`: Your rider JWT token
   - `rider_id`: Rider ID from database
   - `parcel_id`: Parcel ID from database

3. **Add Authorization Header**:
   - For protected routes, add header:
     - Key: `Authorization`
     - Value: `Bearer {{admin_token}}` or `Bearer {{rider_token}}`

4. **Test Flow**:
   - Admin creates/views parcels
   - Admin assigns rider to parcel
   - Rider views assigned parcels
   - Rider updates pickup status
   - Rider updates delivery status
   - Admin views dashboard stats

### Step 6: Complete Test Scenario

```javascript
// 1. Admin views dashboard
const dashboard = await fetch('http://localhost:5000/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
}).then(r => r.json());

// 2. Admin gets all parcels
const parcels = await fetch('http://localhost:5000/api/admin/parcels', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
}).then(r => r.json());

// 3. Admin assigns rider to parcel
const assigned = await fetch(`http://localhost:5000/api/admin/parcels/${parcelId}/assign-rider`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({ riderId: riderId })
}).then(r => r.json());

// 4. Rider views assigned parcels
const riderParcels = await fetch(`http://localhost:5000/api/riders/${riderId}/parcels`, {
  headers: { 'Authorization': `Bearer ${riderToken}` }
}).then(r => r.json());

// 5. Rider updates pickup status
const pickedUp = await fetch(`http://localhost:5000/api/riders/parcels/${parcelId}/pickup`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${riderToken}`
  },
  body: JSON.stringify({ status: 'picked-up' })
}).then(r => r.json());

// 6. Rider updates delivery status
const delivered = await fetch(`http://localhost:5000/api/riders/parcels/${parcelId}/delivery`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${riderToken}`
  },
  body: JSON.stringify({ status: 'delivered' })
}).then(r => r.json());
```

### Important Notes:

- **Replace placeholders**: Replace `YOUR_ADMIN_TOKEN_HERE`, `YOUR_RIDER_TOKEN_HERE`, `RIDER_ID_HERE`, `PARCEL_ID_HERE` with actual values
- **Token Format**: Always use `Bearer TOKEN` format in Authorization header
- **Role Check**: Admin endpoints require user with `role: 'admin'`, Rider endpoints require `role: 'rider'`
- **Database**: Make sure MongoDB is connected and database name is `zip_shift`
- **Error Handling**: Check response status and error messages if requests fail

## 🔧 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:3000` (React default)
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`
- `http://localhost:8080`
- All localhost origins in development mode

## 📁 Project Structure

```
delivery-backend/
├── controllers/     # Business logic
├── models/         # Database schemas
├── routes/         # API routes
├── services/       # External services
├── middlewares/    # Auth & error handling
├── utils/         # Helper functions
├── config/        # Configuration files
├── app.js         # Express app setup
└── index.js       # Server entry point
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify `.env` file exists
- Check MongoDB connection

### CORS errors
- Make sure server is running
- Check frontend URL is in allowed origins
- Verify CORS configuration in `app.js`

### API returns empty data
- This is normal if database is empty
- Create some test data first
- Check MongoDB connection

### 404 errors
- Verify endpoint URL is correct
- Check route is defined in routes folder
- Ensure server is running

## 📚 More Information

- See `API_TEST.md` for detailed API testing examples
- See `FRONTEND_SETUP.md` for frontend integration guide

