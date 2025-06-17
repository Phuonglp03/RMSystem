const mongoose = require('mongoose');

const foodCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },

  }
);



const FoodCategory = mongoose.model('Food_Category', foodCategorySchema);


module.exports = FoodCategory;