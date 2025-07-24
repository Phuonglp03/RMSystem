const mongoose = require('mongoose');

const servantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    assignedTables: [
      {
        tableId: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Table',
          required: true,
        }],
        reservationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reservation',
          required: true,
        },
      },
    ],
    status: [
      {
        type: String,               // e.g., status: { type: String, enum: ['available', 'busy', 'on_break'], default: 'available' }
        trim: true,
      },
    ],
    // shift: {
    //   type: String,
    //   enum: ['morning', 'afternoon', 'evening']
    // },
    // performanceRating: {
    //   type: Number,
    //   min: 0,
    //   max: 5
    // }
  }
);

const Servant = mongoose.model('Servant', servantSchema);

module.exports = Servant;