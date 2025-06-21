const express = require('express');
const router = express.Router();
const foodCategoryController = require('../controllers/foodCategory.controller');

// Create a new food category
router.post('/create', foodCategoryController.createFoodCategory);

// Get all food categories
router.get('/', foodCategoryController.getAllFoodCategories);

// Get food category by ID
router.get('/:id', foodCategoryController.getFoodCategoryById);

// Update food category
router.put('/:id', foodCategoryController.updateFoodCategory);

// Delete food category
router.delete('/:id', foodCategoryController.deleteFoodCategory);

module.exports = router;