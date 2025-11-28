# ZipShift Setup Guide (বাংলা)

## সমস্যা সমাধান এবং Setup প্রক্রিয়া

### সমস্যা কি ছিল?
1. Backend এ `.env` file ছিল না - MongoDB এবং Firebase credentials missing
2. Frontend এ `.env.local` file ছিল না - API URL missing
3. Frontend থেকে Firebase token properly backend এ send হচ্ছিল না
4. MongoDB connection ঠিকমতো কাজ করছিল না

---

## Backend Setup (Server)

### 1. Backend Directory তে যান
```bash
cd ZipShift-Server
```

### 2. `.env` File তৈরি করুন

Backend directory তে `.env` নামে একটি file তৈরি করুন এবং নিচের content দিন:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
# Local MongoDB এর জন্য:
MONGODB_URI=mongodb://localhost:27017/zip_shift

# MongoDB Atlas (Cloud) এর জন্য - আপনার connection string ব্যবহার করুন:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zip_shift?retryWrites=true&w=majority

# Firebase Admin SDK
# firebase-adminsdk.json file automatically read হবে
# যদি manually set করতে চান, uncomment করুন:
# FIREBASE_PROJECT_ID=zip-shift-two
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@zip-shift-two.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Frontend URL (CORS)
SOCKET_CLIENT_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# JWT (Legacy - Firebase auth use করে)
JWT_SECRET=unsafe-local-secret-change-in-production
JWT_EXPIRE=30d
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. MongoDB install করুন (যদি না থাকে):
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. MongoDB service start করুন:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   # বা
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. https://www.mongodb.com/cloud/atlas এ account তৈরি করুন
2. Free cluster create করুন
3. Database Access এ user create করুন
4. Network Access এ আপনার IP add করুন (0.0.0.0/0 সব IP allow করার জন্য)
5. Connect button এ click করে connection string copy করুন
6. `.env` file এ `MONGODB_URI` তে paste করুন

### 4. Dependencies Install করুন
```bash
npm install
```

### 5. Server Start করুন
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server `http://localhost:5000` এ run হবে।

---

## Frontend Setup

### 1. Frontend Directory তে যান
```bash
cd ../ZipShift-Parcel
```

### 2. `.env.local` File তৈরি করুন

Frontend directory তে `.env.local` নামে একটি file তৈরি করুন:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# Socket.IO Server URL
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Dependencies Install করুন
```bash
npm install
```

### 4. Frontend Start করুন
```bash
npm run dev
```

Frontend `http://localhost:5173` এ run হবে।

---

## Testing

### 1. Backend Test
Browser এ যান: `http://localhost:5000/api/health`

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### 2. Frontend Test
1. Browser এ `http://localhost:5173` open করুন
2. Register page এ যান
3. একটি account create করুন
4. Login করুন

### 3. Database Check
MongoDB Compass বা MongoDB shell ব্যবহার করে check করুন:
```javascript
use zip_shift
db.users.find()
```

---

## Common Issues এবং Solutions

### Issue 1: MongoDB Connection Error
**Error:** `MongoDB Connection Error: ECONNREFUSED`

**Solution:**
- Local MongoDB: MongoDB service start করুন
- MongoDB Atlas: Connection string check করুন, IP whitelist করুন

### Issue 2: Firebase Authentication Error
**Error:** `Firebase Admin not initialized`

**Solution:**
- `firebase-adminsdk.json` file check করুন (project root এ থাকতে হবে)
- বা `.env` file এ Firebase credentials set করুন

### Issue 3: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Backend `.env` file এ `FRONTEND_URL` check করুন
- Frontend port match করছে কিনা check করুন (default: 5173)

### Issue 4: User Data MongoDB তে Save হচ্ছে না
**Error:** Registration successful কিন্তু database এ data নেই

**Solution:**
1. Backend console check করুন - MongoDB connection message দেখুন
2. MongoDB connection string verify করুন
3. Database name `zip_shift` আছে কিনা check করুন

### Issue 5: 401 Unauthorized Error
**Error:** `Not authorized to access this route`

**Solution:**
- Frontend থেকে Firebase token properly send হচ্ছে কিনা check করুন
- Browser console এ network tab check করুন - Authorization header আছে কিনা
- Firebase token expire হয়ে গেছে কিনা check করুন

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
দুইটি terminal window open করুন:
- Terminal 1: Backend (`npm run dev`)
- Terminal 2: Frontend (`npm run dev`)

---

## Production Deployment

### Backend
1. `.env` file এ `NODE_ENV=production` set করুন
2. MongoDB Atlas connection string use করুন
3. Firebase credentials properly set করুন
4. Server deploy করুন (Heroku, Railway, DigitalOcean, etc.)

### Frontend
1. `.env.local` file এ production API URL set করুন
2. Build করুন: `npm run build`
3. Build files deploy করুন (Vercel, Netlify, etc.)

---

## Support

যদি আরও help প্রয়োজন হয়:
1. Backend console logs check করুন
2. Frontend browser console check করুন
3. Network tab এ API requests check করুন
4. MongoDB connection verify করুন

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

**সফল Setup এর পর:**
- Users register করতে পারবে
- Users login করতে পারবে
- User data MongoDB তে save হবে
- Frontend এবং Backend properly communicate করবে

