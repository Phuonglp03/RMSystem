import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', // Tham chiếu đến model Customer
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, 
      max: 5, 
    },
    status: {
      type: String,
      trim: true,
      enum: ['pending', 'approved', 'rejected', 'archived'],
      default: 'pending',
    },

  },
  {
    timestamps: true, 
  }
);



const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;