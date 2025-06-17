const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên combo là bắt buộc'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá combo là bắt buộc'],
      min: [0, 'Giá combo không thể âm'],
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng không thể âm'],
    },

  },
  {
    timestamps: true,
  }
);

const Combo = mongoose.model('Combo', comboSchema);

module.exports = Combo;