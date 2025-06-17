const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nguyên liệu là bắt buộc'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IngredientCategory',
      required: [true, 'Danh mục nguyên liệu là bắt buộc'],
    },
    unit: {
      type: String,
      required: [true, 'Đơn vị tính là bắt buộc'],
      trim: true,
      enum: ['kg', 'g', 'ml', 'l', 'pcs', 'bó', 'quả', 'củ']
    },

  },
  {
    timestamps: true,
  }
);

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;