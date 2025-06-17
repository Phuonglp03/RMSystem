const mongoose = require('mongoose');

const ingredientCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục nguyên liệu là bắt buộc'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },

  }
);


const IngredientCategory = mongoose.model(
  'IngredientCategory',
  ingredientCategorySchema
);

module.exports = IngredientCategory;