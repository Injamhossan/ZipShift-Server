// Utility functions (status updates, validations)

// Validate email format
exports.validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
exports.validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format date
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate distance between two coordinates (Haversine formula)
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Sanitize input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validate parcel status transition
exports.isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'pending': ['assigned', 'cancelled'],
    'assigned': ['picked-up', 'cancelled'],
    'picked-up': ['in-transit'],
    'in-transit': ['out-for-delivery'],
    'out-for-delivery': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Get status color (for frontend)
exports.getStatusColor = (status) => {
  const colors = {
    'pending': '#FFA500',
    'assigned': '#4169E1',
    'picked-up': '#32CD32',
    'in-transit': '#1E90FF',
    'out-for-delivery': '#9370DB',
    'delivered': '#228B22',
    'cancelled': '#DC143C'
  };
  return colors[status] || '#808080';
};

// Paginate results
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

