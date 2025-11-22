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
MONGODB_URI=mongodb://localhost:27017/delivery-app
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

