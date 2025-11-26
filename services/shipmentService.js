// Logic for shipping, warehouse, city delivery

const Parcel = require('../models/parcelModel');

const ShipmentService = {
  // Determine warehouse based on city
  async assignWarehouse(city) {
    try {
       
      const warehouseMap = {
        'karachi': 'WH-KHI-001',
        'lahore': 'WH-LHR-001',
        'islamabad': 'WH-ISB-001',
        'rawalpindi': 'WH-RWP-001',
        'faisalabad': 'WH-FSD-001'
      };

      const warehouse = warehouseMap[city.toLowerCase()] || 'WH-DEFAULT-001';
      return warehouse;
    } catch (error) {
      throw new Error(`Warehouse assignment error: ${error.message}`);
    }
  },

  // Calculate estimated delivery time
  async calculateDeliveryTime(originCity, destinationCity) {
    try {
      // In production, use distance calculation and logistics data
      const cityDistances = {
        'karachi-lahore': 24, // hours
        'lahore-islamabad': 4,
        'islamabad-rawalpindi': 1,
        // Add more city pairs
      };

      const key = `${originCity.toLowerCase()}-${destinationCity.toLowerCase()}`;
      const hours = cityDistances[key] || 12; // default 12 hours

      return {
        estimatedHours: hours,
        estimatedDate: new Date(Date.now() + hours * 60 * 60 * 1000)
      };
    } catch (error) {
      throw new Error(`Delivery time calculation error: ${error.message}`);
    }
  },

  // Update shipment status
  async updateShipmentStatus(parcelId, status) {
    try {
      const parcel = await Parcel.findById(parcelId);
      if (!parcel) {
        throw new Error('Parcel not found');
      }

      parcel.status = status;
      
      if (status === 'picked-up') {
        parcel.pickedUpAt = new Date();
      } else if (status === 'delivered') {
        parcel.deliveredAt = new Date();
      }

      await parcel.save();
      return parcel;
    } catch (error) {
      throw new Error(`Shipment status update error: ${error.message}`);
    }
  },

  // Get shipment tracking information
  async getTrackingInfo(trackingNumber) {
    try {
      const parcel = await Parcel.findOne({ trackingNumber })
        .populate('userId', 'name email phone')
        .populate('riderId', 'name phone');

      if (!parcel) {
        throw new Error('Parcel not found');
      }

      return {
        trackingNumber: parcel.trackingNumber,
        status: parcel.status,
        currentLocation: parcel.warehouse || 'In transit',
        estimatedDelivery: await this.calculateDeliveryTime(
          parcel.city,
          parcel.city // In production, use actual origin and destination
        ),
        parcel
      };
    } catch (error) {
      throw new Error(`Tracking info error: ${error.message}`);
    }
  },

  // Route optimization (for multiple deliveries)
  async optimizeRoute(parcels) {
    try {
      // In production, use routing algorithms (TSP, nearest neighbor, etc.)
      // For now, return parcels sorted by address proximity
      return parcels.sort((a, b) => {
        // Simple sorting - in production use geocoding and distance calculation
        return a.recipientAddress.localeCompare(b.recipientAddress);
      });
    } catch (error) {
      throw new Error(`Route optimization error: ${error.message}`);
    }
  }
};

module.exports = ShipmentService;

