const FoodCategory = require('../models/FoodCategory');

// Create a new food category
exports.createFoodCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const foodCategory = new FoodCategory({
      title,
      description
    });

    const savedCategory = await foodCategory.save();
    res.status(201).json({
      message: 'Food category created successfully',
      data: savedCategory
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating food category',
      error: error.message
    });
  }
};

// Get all food categories
exports.getAllFoodCategories = async (req, res) => {
  try {
    const categories = await FoodCategory.find();
    res.status(200).json({
      message: 'Food categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving food categories',
      error: error.message
    });
  }
};

// Get food category by ID
exports.getFoodCategoryById = async (req, res) => {
  try {
    const category = await FoodCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Food category not found' });
    }

    res.status(200).json({
      message: 'Food category retrieved successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving food category',
      error: error.message
    });
  }
};

// Update food category
exports.updateFoodCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const category = await FoodCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Food category not found' });
    }

    // Update fields
    if (title) category.title = title;
    if (description) category.description = description;

    const updatedCategory = await category.save();
    res.status(200).json({
      message: 'Food category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating food category',
      error: error.message
    });
  }
};

// Delete food category
exports.deleteFoodCategory = async (req, res) => {
  try {
    const category = await FoodCategory.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Food category not found' });
    }

    res.status(200).json({
      message: 'Food category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting food category',
      error: error.message
    });
  }
};