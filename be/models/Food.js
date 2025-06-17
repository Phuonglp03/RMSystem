const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên món ăn là bắt buộc'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food_Category',
      required: [true, 'Danh mục món ăn là bắt buộc'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá món ăn là bắt buộc'],
      min: [0, 'Giá món ăn không thể âm'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;