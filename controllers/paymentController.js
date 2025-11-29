const Stripe = require('stripe');
const Parcel = require('../models/parcelModel');

// Initialize Stripe with secret key from env
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, parcelId } = req.body;

    if (!amount || !parcelId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and Parcel ID are required'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents/poisha
      currency: 'bdt',
      metadata: {
        parcelId: parcelId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Confirm Payment and Update Parcel Status
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, parcelId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    // Retrieve the payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update Parcel Status
      // User requested: "payment korle oi parcel ta delevey stage a jabe"
      // So we set paymentStatus to 'paid' and status to 'out-for-delivery' (or 'assigned' if that's the flow)
      // Let's go with 'out-for-delivery' as it matches "delivery stage" best.
      
      const updatedParcel = await Parcel.findByIdAndUpdate(
        parcelId || paymentIntent.metadata.parcelId,
        {
          paymentStatus: 'paid',
          status: 'out-for-delivery', // Or 'assigned' depending on exact flow, but 'out-for-delivery' implies moving.
          // If we want to be safer, maybe 'assigned' is better if it needs a rider first?
          // But user said "delivery stage". Let's stick to 'out-for-delivery' or 'in-transit'.
          // Actually, looking at the enum: 'Pending', 'Picked', 'On the way', 'Delivered'.
          // 'out-for-delivery' is also in the enum list (lower case).
          // Let's use 'out-for-delivery'.
        },
        { new: true }
      );

      if (!updatedParcel) {
        return res.status(404).json({
          success: false,
          message: 'Parcel not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed and parcel status updated',
        parcel: updatedParcel
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment not succeeded. Status: ${paymentIntent.status}`
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
