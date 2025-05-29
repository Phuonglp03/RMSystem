import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
      unique: true, 
    },
    coupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon', 
      },
    ],
    points: {
      type: Number,
      default: 0,
      min: 0, 
    },
    feedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback', 
      },
    ],
    reservationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation', 
      },
    ],
    
  }
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;