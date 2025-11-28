# ZipShift Setup Guide (English)

## Problem Resolution and Setup Process

### What were the issues?
1. Backend missing `.env` file - MongoDB and Firebase credentials missing
2. Frontend missing `.env.local` file - API URL missing
3. Firebase token not being sent properly from frontend to backend
4. MongoDB connection not working properly

---

## Backend Setup (Server)

### 1. Navigate to Backend Directory
```bash
cd ZipShift-Server
```

### 2. Create `.env` File

Create a file named `.env` in the backend directory with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/zip_shift

# For MongoDB Atlas (Cloud) - Use your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zip_shift?retryWrites=true&w=majority

# Firebase Admin SDK
# firebase-adminsdk.json file will be automatically read
# If you want to set manually, uncomment:
# FIREBASE_PROJECT_ID=zip-shift-two
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@zip-shift-two.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend URL (CORS)
SOCKET_CLIENT_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# JWT (Legacy - using Firebase auth)
JWT_SECRET=unsafe-local-secret-change-in-production
JWT_EXPIRE=30d
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB (if not installed):
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a user in Database Access
4. Add your IP in Network Access (0.0.0.0/0 to allow all IPs)
5. Click Connect button and copy the connection string
6. Paste it in `MONGODB_URI` in `.env` file

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will run at `http://localhost:5000`.

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../ZipShift-Parcel
```

### 2. Create `.env.local` File

Create a file named `.env.local` in the frontend directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# Socket.IO Server URL
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Frontend
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`.

---

## Testing

### 1. Backend Test
Open in browser: `http://localhost:5000/api/health`

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### 2. Frontend Test
1. Open `http://localhost:5173` in browser
2. Go to Register page
3. Create an account
4. Login

### 3. Database Check
Use MongoDB Compass or MongoDB shell to check:
```javascript
use zip_shift
db.users.find()
```

---

## Common Issues and Solutions

### Issue 1: MongoDB Connection Error
**Error:** `MongoDB Connection Error: ECONNREFUSED`

**Solution:**
- Local MongoDB: Start MongoDB service
- MongoDB Atlas: Check connection string, whitelist IP

### Issue 2: Firebase Authentication Error
**Error:** `Firebase Admin not initialized`

**Solution:**
- Check `firebase-adminsdk.json` file (should be in project root)
- Or set Firebase credentials in `.env` file

### Issue 3: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Check `FRONTEND_URL` in backend `.env` file
- Verify frontend port matches (default: 5173)

### Issue 4: User Data Not Saving to MongoDB
**Error:** Registration successful but no data in database

**Solution:**
1. Check backend console - look for MongoDB connection message
2. Verify MongoDB connection string
3. Check if database name is `zip_shift`

### Issue 5: 401 Unauthorized Error
**Error:** `Not authorized to access this route`

**Solution:**
- Check if Firebase token is being sent properly from frontend
- Check browser console network tab - verify Authorization header exists
- Check if Firebase token has expired

---

## Development Workflow

### Backend Development
```bash
cd ZipShift-Server
npm run dev  # nodemon auto-reload
```

### Frontend Development
```bash
cd ZipShift-Parcel
npm run dev  # Vite dev server
```

### Both Together
Open two terminal windows:
- Terminal 1: Backend (`npm run dev`)
- Terminal 2: Frontend (`npm run dev`)

---

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env` file
2. Use MongoDB Atlas connection string
3. Set Firebase credentials properly
4. Deploy server (Heroku, Railway, DigitalOcean, etc.)

### Frontend
1. Set production API URL in `.env.local` file
2. Build: `npm run build`
3. Deploy build files (Vercel, Netlify, etc.)

---

## Support

If you need more help:
1. Check backend console logs
2. Check frontend browser console
3. Check API requests in network tab
4. Verify MongoDB connection

---

## Quick Checklist

- [ ] Backend `.env` file created
- [ ] MongoDB running/connected
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend `.env.local` file created
- [ ] Frontend running (`npm run dev`)
- [ ] Test registration
- [ ] Test login
- [ ] Check MongoDB for user data

---

**After successful setup:**
- Users can register
- Users can login
- User data will be saved to MongoDB
- Frontend and Backend will communicate properly

