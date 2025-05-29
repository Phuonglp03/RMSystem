import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    bookedTable: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true,
      },
    ],
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', 
      required: true,
    },
    servantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servant', 
    },
    reservationCode: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], 
      default: 'pending',
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1, 
    },
    note: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: Boolean,
      default: false, 
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

export default Reservation;