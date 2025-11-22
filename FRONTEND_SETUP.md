# Frontend Setup Guide

## API Base URL
```
http://localhost:5000/api
```

## Allowed Frontend Origins
The following frontend URLs are allowed by CORS:
- `http://localhost:3000` (React default)
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`
- `http://localhost:8080`

## API Endpoints

### Parcels
- `GET /api/parcels` - Get all parcels
- `GET /api/parcels/:parcelId` - Get parcel by ID
- `POST /api/parcels` - Create new parcel
- `PUT /api/parcels/:parcelId/payment` - Update payment status
- `PUT /api/parcels/:parcelId/assign` - Assign delivery

### Riders
- `GET /api/riders` - Get all riders
- `GET /api/riders/:riderId` - Get rider by ID
- `PUT /api/riders/:riderId/availability` - Update availability
- `PUT /api/riders/parcels/:parcelId/pickup` - Update pickup status
- `PUT /api/riders/parcels/:parcelId/delivery` - Update delivery status

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/parcels` - Get all parcels (admin view)
- `GET /api/admin/riders` - Get all riders (admin view)
- `PUT /api/admin/parcels/:parcelId/assign-rider` - Assign rider to parcel

## Frontend Example (React/Axios)

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Frontend Example (Fetch API)

```javascript
// Fetch example
const API_BASE_URL = 'http://localhost:5000/api';

// Get all parcels
fetch(`${API_BASE_URL}/parcels`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Create parcel
fetch(`${API_BASE_URL}/parcels`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // if needed
  },
  body: JSON.stringify({
    senderName: 'John Doe',
    senderPhone: '1234567890',
    // ... other fields
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Environment Variables for Frontend

Create a `.env` file in your frontend project:
```
REACT_APP_API_URL=http://localhost:5000/api
```
or for Vite:
```
VITE_API_URL=http://localhost:5000/api
```

