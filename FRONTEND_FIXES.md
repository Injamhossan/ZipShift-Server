# Frontend Fixes Required

## Important Changes Needed

### 1. Fix Register.jsx - Send Firebase Token Properly

**File:** `ZipShift-Parcel/src/pages/Register/Register.jsx`

**Change 1:** Line 50-57 - Update register call to send Firebase token:

```javascript
// OLD CODE:
const backendResponse = await authApi.register({
  name: data.name,
  email: data.email,
  phone: data.phone,
  uid: response.user.uid, // Firebase UID
  password: data.password, // Send password for backend to hash
  role: data.role || 'merchant',
});

// NEW CODE:
const backendResponse = await authApi.register({
  name: data.name,
  email: data.email,
  phone: data.phone,
  role: data.role === 'merchant' ? 'user' : data.role, // Backend expects 'user' not 'merchant'
  company: data.company || '',
  address: data.address || '',
  city: data.city || '',
  pickupArea: data.pickupArea || '',
}, response.token); // Pass Firebase token as second parameter
```

**Change 2:** Line 119-126 - Update Google sign-in register call:

```javascript
// OLD CODE:
const backendResponse = await authApi.register({
  name: response.user.displayName || 'User',
  email: response.user.email,
  phone: response.user.phoneNumber || '',
  uid: response.user.uid, // Firebase UID
  role: selectedRole,
  // No password for Google sign-in
});

// NEW CODE:
const backendResponse = await authApi.register({
  name: response.user.displayName || 'User',
  email: response.user.email,
  phone: response.user.phoneNumber || '',
  role: selectedRole === 'merchant' ? 'user' : selectedRole, // Backend expects 'user' not 'merchant'
  company: '',
  address: '',
  city: '',
  pickupArea: '',
}, response.token); // Pass Firebase token as second parameter
```

### 2. Fix authApi.js - Accept Firebase Token Parameter

**File:** `ZipShift-Parcel/src/utils/authApi.js`

**Change:** Line 43-69 - Update register function to accept and use Firebase token:

```javascript
// OLD CODE:
register: async (userData) => {
  try {
    console.log('Sending registration request to backend:', {
      url: `${API_URL}/auth/register`,
      data: { ...userData, password: userData.password ? '***' : undefined },
    });
    
    const response = await api.post('/auth/register', userData);
    
    console.log('Backend registration response:', response.data);
    
    return response.data;
  } catch (error) {
    // ... error handling
  }
},

// NEW CODE:
register: async (userData, firebaseToken) => {
  try {
    console.log('Sending registration request to backend:', {
      url: `${API_URL}/auth/register`,
      data: { ...userData, password: userData.password ? '***' : undefined },
    });
    
    // Create a temporary axios instance with the Firebase token
    const registerApi = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(firebaseToken && { Authorization: `Bearer ${firebaseToken}` }),
      },
      withCredentials: false
    });
    
    const response = await registerApi.post('/auth/register', userData);
    
    console.log('Backend registration response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    
    const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
    toast.error(message);
    throw error;
  }
},
```

### 3. Fix Login.jsx - Remove Fallback API Call

**File:** `ZipShift-Parcel/src/pages/Login/Login.jsx`

**Change:** Line 32-40 - Remove fallback API call (backend only accepts Firebase tokens):

```javascript
// OLD CODE:
} catch (firebaseError) {
  // Fallback to API if Firebase fails
  const response = await authApi.login(data);
  if (response.success) {
    login(response.user, response.token);
    toast.success('Login successful!');
    navigate('/dashboard');
  }
}

// NEW CODE:
} catch (firebaseError) {
  console.error('Firebase login error:', firebaseError);
  // Firebase login failed, show error
  toast.error('Login failed. Please check your credentials.');
}
```

### 4. Create .env.local File

**File:** `ZipShift-Parcel/.env.local` (create new file)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# Socket.IO Server URL
VITE_SOCKET_URL=http://localhost:5000
```

---

## Summary of Issues Fixed

1. **Firebase Token Not Sent**: Backend requires Firebase ID token in Authorization header, but frontend was sending `uid` in body
2. **Role Mismatch**: Frontend sends 'merchant' but backend expects 'user'
3. **Missing Environment Variables**: Frontend needs `.env.local` file for API URL
4. **Login Fallback**: Removed unnecessary API fallback since backend only accepts Firebase tokens

---

## Testing After Fixes

1. **Registration Test:**
   - Go to Register page
   - Fill form and submit
   - Check browser console for successful registration
   - Check MongoDB for user data

2. **Login Test:**
   - Go to Login page
   - Enter credentials and login
   - Should redirect to dashboard
   - Check browser console for successful login

3. **Database Verification:**
   - Connect to MongoDB
   - Check `zip_shift` database
   - Verify `users` collection has new user data

---

## Key Points

- Backend **only accepts Firebase ID tokens** (not email/password directly)
- Frontend must send Firebase token in `Authorization: Bearer <token>` header
- Role should be 'user' for merchants (not 'merchant')
- All authentication goes through Firebase first, then backend validates token

