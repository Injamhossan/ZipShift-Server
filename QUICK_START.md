# Quick Start Guide - ZipShift

## 🚀 Fast Setup (5 Minutes)

### Backend Setup

1. **Go to backend directory:**
```bash
cd ZipShift-Server
```

2. **Create `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zip_shift
SOCKET_CLIENT_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
JWT_SECRET=unsafe-local-secret
JWT_EXPIRE=30d
```

3. **Install & Run:**
```bash
npm install
npm run dev
```

### Frontend Setup

1. **Go to frontend directory:**
```bash
cd ../ZipShift-Parcel
```

2. **Create `.env.local` file:**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

3. **Apply Code Fixes:**
   - Open `FRONTEND_FIXES.md` and follow instructions
   - Main fix: Update `Register.jsx` and `authApi.js` to send Firebase token

4. **Install & Run:**
```bash
npm install
npm run dev
```

---

## ✅ Verify Setup

1. **Backend:** Open http://localhost:5000/api/health
2. **Frontend:** Open http://localhost:5173
3. **Test:** Register a new user → Check MongoDB

---

## 📖 Full Documentation

- `SETUP_GUIDE_BN.md` - Complete guide (Bengali)
- `SETUP_GUIDE.md` - Complete guide (English)
- `FRONTEND_FIXES.md` - Code fixes needed
- `PROBLEM_ANALYSIS_AND_SOLUTION.md` - Detailed analysis

---

## ⚠️ Important

1. **MongoDB must be running** (local or Atlas)
2. **Firebase token must be sent** in Authorization header
3. **Role should be 'user'** not 'merchant' for backend

---

**Need help?** Check the full setup guides above! 📚

