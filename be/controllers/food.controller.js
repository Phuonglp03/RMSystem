const Food = require('../models/Food');
const mongoose = require('mongoose');
const multer = require('multer');
const { uploadImages } = require('../services/UploadService');
const cloudinary = require('cloudinary').v2;

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
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🍽️ Creating new food item: ${req.body.name}`);
  
  try {
    const { name, categoryId, description, price, isAvailable } = req.body;
    
    // Kiểm tra trùng tên
    const existingFood = await Food.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingFood) {
      console.log(`[${new Date().toISOString()}] ❌ Food creation failed: Name "${name}" already exists`);
      return res.status(400).json({
        status: 'fail',
        message: `Món ăn "${name}" đã tồn tại! Vui lòng chọn tên khác.`,
      });
    }
    
    let images = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      console.log(`[${new Date().toISOString()}] 📸 Uploading ${req.files.length} images to Cloudinary...`);
      images = await uploadImages(req.files, 'foods');
      console.log(`[${new Date().toISOString()}] ✅ Images uploaded successfully`);
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
    const endTime = Date.now();
    
    console.log(`[${new Date().toISOString()}] ✅ Food created successfully: ${savedFood.name} (${endTime - startTime}ms)`);
    
    res.status(201).json({
      status: 'success',
      data: savedFood,
    });
  } catch (error) {
    const endTime = Date.now();
    console.error(`[${new Date().toISOString()}] ❌ Food creation error (${endTime - startTime}ms):`, error.message);
    
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Update a food item
exports.updateFood = async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🔄 Updating food item: ${req.params.id}`);
  
  try {
    const foodId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID món ăn không hợp lệ',
      });
    }

    // Lấy thông tin món ăn hiện tại
    const currentFood = await Food.findById(foodId);
    if (!currentFood) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy món ăn',
      });
    }
    
    // Kiểm tra trùng tên (nếu có thay đổi tên)
    if (req.body.name && req.body.name !== currentFood.name) {
      const existingFood = await Food.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: foodId }
      });
      
      if (existingFood) {
        console.log(`[${new Date().toISOString()}] ❌ Food update failed: Name "${req.body.name}" already exists`);
        return res.status(400).json({
          status: 'fail',
          message: `Món ăn "${req.body.name}" đã tồn tại! Vui lòng chọn tên khác.`,
        });
      }
    }

    const updateData = { ...req.body };
    
    // Xử lý ảnh
    let finalImages = [];
    
    // Lấy danh sách ảnh cũ cần giữ lại từ frontend
    const keepOldImages = req.body.keepOldImages ? JSON.parse(req.body.keepOldImages) : [];
    
    // Nếu có keepOldImages trong request, nghĩa là frontend đang quản lý ảnh
    if (req.body.keepOldImages !== undefined) {
      finalImages = [...keepOldImages];
      
      // Thêm ảnh mới nếu có
      if (req.files && req.files.length > 0) {
        const newImages = await uploadImages(req.files, 'foods');
        finalImages = [...finalImages, ...newImages];
      }
    } else {
      // Nếu không có keepOldImages, nghĩa là chỉ cập nhật thông tin không liên quan đến ảnh
      finalImages = currentFood.images || [];
      
      // Chỉ thêm ảnh mới nếu có
      if (req.files && req.files.length > 0) {
        const newImages = await uploadImages(req.files, 'foods');
        finalImages = [...finalImages, ...newImages];
      }
    }
    
    // Cập nhật danh sách ảnh
    updateData.images = finalImages;
    
    // Xóa ảnh cũ không còn sử dụng khỏi Cloudinary
    const oldImages = currentFood.images || [];
    const imagesToDelete = oldImages.filter(oldImg => !finalImages.includes(oldImg));
    
    if (imagesToDelete.length > 0) {
      const publicIds = imagesToDelete.map(url => {
        const parts = url.split('/');
        return parts[parts.length - 1].split('.')[0];
      });
      
      // Xóa ảnh cũ từ Cloudinary (không await để không ảnh hưởng response time)
      Promise.all(
        publicIds.map(publicId =>
          cloudinary.uploader.destroy(`foods/${publicId}`)
        )
      ).catch(err => console.error('Error deleting old images:', err));
    }

    const updatedFood = await Food.findByIdAndUpdate(foodId, updateData, {
      new: true,
      runValidators: true,
    });
    
    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] ✅ Food updated successfully: ${updatedFood.name} (${endTime - startTime}ms)`);
    
    if (req.files && req.files.length > 0) {
      console.log(`[${new Date().toISOString()}] 📸 ${req.files.length} new images uploaded`);
    }
    
    if (imagesToDelete.length > 0) {
      console.log(`[${new Date().toISOString()}] 🗑️ ${imagesToDelete.length} old images scheduled for deletion`);
    }

    res.status(200).json({
      status: 'success',
      data: updatedFood,
    });
  } catch (error) {
    const endTime = Date.now();
    console.error(`[${new Date().toISOString()}] ❌ Food update error (${endTime - startTime}ms):`, error.message);
    
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
      .populate('categoryId', 'title')
      .populate('ingredients', 'title');
    
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
      .populate('categoryId', 'title')
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