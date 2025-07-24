const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    bookedTable: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
      },
    ],
    customerId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false,
    }],
    servantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servant',
      required: false,
    },
    reservationCode: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: false,
    },
    endTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: false,
      trim: true,
      enum: ['pending', 'confirmed', 'served', 'completed', 'cancelled'],
      default: 'pending',
    },
    numberOfPeople: {
      type: Number,
      required: false,
      min: 1,
    },
    note: {
      type: String,
      trim: true,
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'success', 'failed'], 
      default: 'pending' 
  },
  paymentMethod: { 
      type: String, 
      enum: ['cash', 'momo', 'vnpay', 'payos'], 
      default: null 
  },
  totalAmount: {
      type: Number,
      default: 0,
      min: 0,
  },
  paidAt: Date,
  reservation_payment_id: { 
      type: String, 
      index: true 
  },

  },
  {
    timestamps: true,
  }
);

// Validation để đảm bảo endTime sau startTime
reservationSchema.pre('save', function (next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    next(new Error('End time must be after start time.'));
  } else {
    next();
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;