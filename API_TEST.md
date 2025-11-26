# API Test Guide

All protected routes require the Firebase ID token that the dashboard already issues on login. Replace `zipshift_token` below with wherever you persist the token today.

```javascript
const API_BASE = 'http://localhost:5000/api';

const authFetch = (path, options = {}) => {
  const token = localStorage.getItem('zipshift_token');
  return fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    ...options
  }).then(async (res) => {
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.message || 'Request failed');
    return payload;
  });
};
```

## Registration (New)

### Register as Merchant (User)
```javascript
await authFetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    role: 'user',
    company: 'My Delivery Co',
    address: '123 Main St',
    city: 'Dhaka',
    pickupArea: 'Gulshan'
  })
});
```

### Register as Rider
```javascript
await authFetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    role: 'rider',
    vehicleType: 'bike',
    vehicleNumber: 'DHAKA-METRO-HA-12-3456',
    licenseNumber: 'DL-12345678',
    name: 'Rider Name', // Optional if in Firebase token
    phone: '+8801700000000' // Optional if in Firebase token
  })
});
```

## Health & Connectivity

```javascript
await fetch('http://localhost:5000/api/health').then((r) => r.json());
await authFetch('/dashboard/summary'); // validates Firebase + DB access
```

## Dashboard Summary

```javascript
const { data } = await authFetch('/dashboard/summary');
console.log(data.summary.totalShipments, data.billing.walletBalance);
```

## Parcels

### List with pagination/filter
```javascript
const parcels = await authFetch('/parcels?status=all&page=1&limit=20');
console.log(parcels.data.results, parcels.data.pagination);
```

### Create parcel
```javascript
await authFetch('/parcels', {
  method: 'POST',
  body: JSON.stringify({
    customerName: 'Jane Smith',
    customerPhone: '+8801600000000',
    address: 'House 10, Road 3, Banani, Dhaka',
    pickupArea: 'Dhaka Hub',
    weight: 1.2,
    cod: 1250,
    note: 'Leave with guard'
  })
});
```

### Parcel details
```javascript
const parcel = await authFetch(`/parcels/${parcelId}`);
console.log(parcel.data.timeline);
```

## Tracking (Public)

```javascript
await fetch(`${API_BASE}/tracking/${trackingId}`)
  .then((r) => r.json())
  .then((payload) => console.log(payload.data.hub));
```

## Billing Snapshot

```javascript
const billing = await authFetch('/billing');
console.log(billing.data.walletBalance, billing.data.payouts);
```

## Support Ticket

```javascript
await authFetch('/support/tickets', {
  method: 'POST',
  body: JSON.stringify({
    subject: 'Need pickup reschedule',
    details: 'Please move parcel ZIP123 to tomorrow morning.'
  })
});
```

## Profile Update

```javascript
await authFetch('/profile', {
  method: 'PATCH',
  body: JSON.stringify({
    name: 'Acme Logistics',
    phone: '+8801888997777',
    company: 'Acme BD',
    pickupArea: 'Uttara Warehouse',
    address: 'Plot 15, Sector 3'
  })
});
```

## Axios Alternative

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('zipshift_token')}`;
  return config;
});

const { data } = await api.get('/parcels', { params: { status: 'Pending', page: 1 } });
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `401 Unauthorized` | Token missing/expired or Firebase service-account vars not set on backend |
| Socket connect error | Ensure `auth.token` sent to Socket.IO and `SOCKET_CLIENT_ORIGIN` includes the frontend origin |
| Empty dashboard | Seed data via `POST /api/parcels` |
| 404 on endpoints | Confirm path includes `/api/...` and restart the server after modifying routes |


