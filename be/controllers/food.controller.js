const Food = require('../models/Food');
const mongoose = require('mongoose');
const multer = require('multer');
const { uploadImages } = require('../services/UploadService');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn file 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  },
});

// Create a new food item
exports.createFood = async (req, res) => {
  try {
    const { name, categoryId, description, price, isAvailable } = req.body;
    let images = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      images = await uploadImages(req.files, 'foods');
    }

    const food = new Food({
      name,
      categoryId,
      description,
      price,
      images,
      isAvailable,
    });

    const savedFood = await food.save();
    res.status(201).json({
      status: 'success',
      data: savedFood,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a food item
exports.updateFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID món ăn không hợp lệ',
      });
    }

    const updateData = { ...req.body };
    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      updateData.images = await uploadImages(req.files, 'foods');
    }

    const updatedFood = await Food.findByIdAndUpdate(foodId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedFood) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy món ăn',
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedFood,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Delete a food item
exports.deleteFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID món ăn không hợp lệ',
      });
    }

    const deletedFood = await Food.findByIdAndDelete(foodId);

    if (!deletedFood) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy món ăn',
      });
    }

    // Optionally delete images from Cloudinary
    if (deletedFood.images && deletedFood.images.length > 0) {
      const publicIds = deletedFood.images.map(url => {
        const parts = url.split('/');
        return parts[parts.length - 1].split('.')[0];
      });
      
      await Promise.all(
        publicIds.map(publicId =>
          cloudinary.uploader.destroy(`foods/${publicId}`)
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Delete Food Error:', error); // Debug
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get all food items
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find()
      .populate('categoryId', 'name')
      .populate('ingredients', 'name');
    
    res.status(200).json({
      status: 'success',
      results: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error('Get All Foods Error:', error); // Debug
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get food item by ID
exports.getFoodById = async (req, res) => {
  try {
    const foodId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID món ăn không hợp lệ',
      });
    }

    const food = await Food.findById(foodId)
      .populate('categoryId', 'name')
      .populate('ingredients', 'name');

    if (!food) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy món ăn',
      });
    }

    res.status(200).json({
      status: 'success',
      data: food,
    });
  } catch (error) {
    console.error('Get Food By ID Error:', error); // Debug
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

module.exports.upload = upload; // Export multer upload middleware