# API Test Guide

## Quick Test from Frontend

### 1. Test Server Connection
```javascript
// Test if server is running
fetch('http://localhost:5000/api/test')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));
```

### 2. Test Health Check
```javascript
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. Get All Parcels (No Auth Required)
```javascript
fetch('http://localhost:5000/api/parcels')
  .then(res => res.json())
  .then(data => {
    console.log('Parcels:', data);
  })
  .catch(err => console.error('Error:', err));
```

### 4. Get All Riders (No Auth Required)
```javascript
fetch('http://localhost:5000/api/riders')
  .then(res => res.json())
  .then(data => {
    console.log('Riders:', data);
  })
  .catch(err => console.error('Error:', err));
```

### 5. Create Parcel (No Auth Required for Testing)
```javascript
fetch('http://localhost:5000/api/parcels', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
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

## Using Axios (Recommended)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test connection
axios.get(`${API_URL}/test`)
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));

// Get parcels
axios.get(`${API_URL}/parcels`)
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Make sure server is running and CORS is configured. Check browser console for specific error.

### Issue: Connection Refused
**Solution:** 
1. Make sure server is running: `npm run dev`
2. Check if port 5000 is available
3. Verify server started successfully

### Issue: 404 Not Found
**Solution:** Check the API endpoint URL. Should be `http://localhost:5000/api/...`

### Issue: Empty Response
**Solution:** This is normal if database is empty. Try creating a parcel first.

