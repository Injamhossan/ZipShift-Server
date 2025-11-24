# ZipShift Delivery Backend

Backend API + Socket.IO transport for the ZipShift merchant dashboard. It exposes parcel management, billing, tracking, support, and profile endpoints that the Vite dashboard consumes in real time.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create `.env`**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/zip_shift

   # Firebase service account used to validate dashboard JWTs
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Frontend / socket origins
   SOCKET_CLIENT_ORIGIN=http://localhost:5173

   # Legacy JWT helpers (only needed for local scripts)
   JWT_SECRET=unsafe-local-secret
   JWT_EXPIRE=30d
   ```
3. **Run the server**
   ```bash
   npm run dev      # nodemon
   # or
   npm start
   ```

Server boots at `http://localhost:5000` and exposes REST under `/api` plus Socket.IO over the same host.

## 🔐 Authentication

- Every protected route expects a Firebase ID token (`Authorization: Bearer <token>`).
- The middleware verifies the token, upserts the user in MongoDB (stores `firebaseUid`), and injects `req.user`.
- Socket.IO reuses the same token in `auth.token` (recommended) or `Authorization` header to join the user’s personal room (`uid`), enabling targeted broadcasts.

## 🌐 Core API Surface

| Area | Method & Path | Notes |
|------|---------------|-------|
| Health | `GET /api/health` | Simple uptime probe |
| Dashboard cards | `GET /api/dashboard/summary` | Aggregated parcel + billing stats |
| Parcels list | `GET /api/parcels?status=all&page=1&limit=10` | Authenticated, paginated |
| Parcel details | `GET /api/parcels/:parcelId` | Merchant-scoped |
| Create parcel | `POST /api/parcels` | `{ customerName, customerPhone, address, weight, cod, note, pickupArea }` |
| Tracking lookup | `GET /api/tracking/:trackingId` | Public, returns hub/ETA/timeline |
| Billing | `GET /api/billing` | `{ walletBalance, pendingCod, lastPayout, payouts[] }` |
| Support | `POST /api/support/tickets` | `{ subject, details }` |
| Profile | `PATCH /api/profile` | `{ name, phone, company, address, pickupArea }` |

All responses follow the shared envelope:
```json
{
  "success": true,
  "data": {...},
  "message": "human readable note"
}
```

## ⚡ Real‑time Channels

Socket events fired by the backend:

| Event | Payload |
|-------|---------|
| `dashboard:summary` | Latest summary object (same shape as REST) |
| `parcels:created` | Newly created parcel (card/table refresh) |
| `parcels:updated` | `{ id, status, timeline, ... }` |
| `billing:payout` | Billing snapshot after COD/payout changes |
| `support:ticket-status` | Ticket number + status updates |

Client usage (Vite):
```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: { token: user?.token }
});

socket.on('dashboard:summary', setSummary);
socket.on('parcels:created', prependParcel);
socket.on('parcels:updated', updateParcel);
socket.on('billing:payout', refreshBilling);
```

## 🧱 Data Contracts

- `Parcel` schema now includes dashboard-friendly fields (`customerName`, `codAmount`, `pickupArea`, `timeline[]`, `trackingId` virtual).
- `Billing` snapshot keeps wallet balances and payout history per merchant.
- `SupportTicket` stores `{ ticketNumber, subject, details, status, updates[] }`.

See `models/*.js` for the exact MongoDB schema definitions.

## 🧪 Testing Checklist

1. **Get a Firebase ID token** (from your existing dashboard login flow).
2. **Call protected APIs** with `Authorization: Bearer <token>`.
3. **Create a parcel** and watch:
   - REST response with tracking/timeline data.
   - `parcels:created`, `dashboard:summary`, and `billing:payout` events over Socket.IO.
4. **Submit support ticket** and verify `support:ticket-status`.
5. **Run tracking search** via `GET /api/tracking/:trackingId` to confirm timeline payload.

`API_TEST.md` contains ready-to-run fetch/axios snippets for each route.

## 🌍 Frontend Environment (Vite)

Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

`src/utils/authApi.js` should read `VITE_API_BASE_URL` when composing requests and send the Firebase token automatically.

## 📁 Project Structure

```
delivery-backend/
├── controllers/          # REST handlers (dashboard, parcels, billing, etc.)
├── models/               # Mongoose schemas
├── routes/               # Express routers per domain
├── services/             # Firebase admin + Socket.IO helpers
├── middlewares/          # Auth + error handling
├── config/               # Env + Mongo connection
├── app.js                # Express app wiring
└── index.js              # HTTP + Socket.IO bootstrap
```

## 🛠 Troubleshooting

- **Firebase token rejected** → confirm `.env` service-account values and that the dashboard sends a current ID token.
- **Socket auth errors** → ensure the client sets `auth.token` or `Authorization: Bearer <token>`.
- **CORS blocked** → adjust `SOCKET_CLIENT_ORIGIN` or `corsOptions` in `app.js`.
- **Empty dashboard data** → seed parcels via `POST /api/parcels` or Mongo shell.

For endpoint-specific payloads and Postman examples, open `API_TEST.md`. For frontend wiring tips, see `FRONTEND_SETUP.md`.

