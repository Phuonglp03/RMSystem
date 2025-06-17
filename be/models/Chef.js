const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    experiencedYear: {
      type: Number,
      min: 0,
    },
    status: [
      {
        type: String,          // e.g., status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' }
        trim: true,
      },
    ],
    currentOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    certifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certification',
      },
    ],

  }
);

const Chef = mongoose.model('Chef', chefSchema);

module.exports = Chef;