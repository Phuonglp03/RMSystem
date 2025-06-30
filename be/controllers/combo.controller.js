const Combo = require('../models/Combo');
const ComboItem = require('../models/ComboItem');
const Food = require('../models/Food');
const mongoose = require('mongoose');
const multer = require('multer');
const { uploadImages } = require('../services/UploadService');

// Multer config cho combo (1 ảnh)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  },
});

exports.upload = upload;

// Create Combo với Items
exports.createCombo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let { name, description, price, isActive, quantity, items } = req.body;
    
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    
    // Xử lý upload ảnh
    let image = '';
    if (req.file) {
      const urls = await uploadImages([req.file], 'combos');
      image = urls[0];
    }

    // Tạo combo mới
    const combo = new Combo({ 
      name, 
      description, 
      price: Number(price), 
      isActive: isActive === 'true' || isActive === true, 
      quantity: Number(quantity), 
      image 
    });
    
    const savedCombo = await combo.save({ session });

    // Thêm items vào combo nếu có
    if (items && Array.isArray(items) && items.length > 0) {
      // Kiểm tra món ăn trùng lặp
      const foodIds = items.map(item => item.foodId);
      const uniqueFoodIds = [...new Set(foodIds)];
      
      if (foodIds.length !== uniqueFoodIds.length) {
        await session.abortTransaction();
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Không thể thêm cùng một món ăn nhiều lần vào combo. Vui lòng chọn món ăn khác nhau.' 
        });
      }

      // Validate quantity > 0
      for (const item of items) {
        if (!item.foodId || Number(item.quantity) <= 0) {
          await session.abortTransaction();
          return res.status(400).json({ 
            status: 'fail', 
            message: 'Mỗi món ăn trong combo phải có số lượng lớn hơn 0.' 
          });
        }
      }

      const comboItems = items.map(item => ({
        comboId: savedCombo._id,
        foodId: item.foodId,
        quantity: Number(item.quantity)
      }));

      await ComboItem.insertMany(comboItems, { session });
    }

    await session.commitTransaction();
    
    // Lấy combo với items để trả về
    const comboWithItems = await Combo.findById(savedCombo._id);
    const comboItemsData = await ComboItem.find({ comboId: savedCombo._id })
      .populate('foodId', 'name price images')
      .session(null);

    res.status(201).json({ 
      status: 'success', 
      data: {
        ...comboWithItems.toObject(),
        items: comboItemsData
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating combo:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  } finally {
    session.endSession();
  }
};

// Get all Combos với Items
exports.getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.find();
    
    // Lấy items cho mỗi combo
    const combosWithItems = await Promise.all(
      combos.map(async (combo) => {
        const items = await ComboItem.find({ comboId: combo._id })
          .populate('foodId', 'name price images');
        return {
          ...combo.toObject(),
          items
        };
      })
    );

    res.status(200).json({ 
      status: 'success', 
      results: combosWithItems.length, 
      data: combosWithItems 
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};



// Update Combo và Items
exports.updateCombo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const comboId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo không hợp lệ' });
    }

    let { name, description, price, isActive, quantity, items } = req.body;
    
    // Parse items nếu nó là string (từ FormData)
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }
    
    // Chỉ update những trường được gửi lên
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (quantity !== undefined) updateData.quantity = Number(quantity);

    // Xử lý upload ảnh mới
    if (req.file) {
      const urls = await uploadImages([req.file], 'combos');
      updateData.image = urls[0];
    }

    // Cập nhật combo
    const updatedCombo = await Combo.findByIdAndUpdate(
      comboId, 
      updateData, 
      { new: true, runValidators: true, session }
    );

    if (!updatedCombo) {
      await session.abortTransaction();
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo' });
    }

    // Cập nhật items nếu có (chỉ khi items được gửi lên trong request)
    if (items !== undefined && Array.isArray(items)) {
      // Kiểm tra món ăn trùng lặp nếu có items
      if (items.length > 0) {
        const foodIds = items.map(item => item.foodId);
        const uniqueFoodIds = [...new Set(foodIds)];
        
        if (foodIds.length !== uniqueFoodIds.length) {
          await session.abortTransaction();
          return res.status(400).json({ 
            status: 'fail', 
            message: 'Không thể thêm cùng một món ăn nhiều lần vào combo. Vui lòng chọn món ăn khác nhau.' 
          });
        }

        // Validate quantity > 0
        for (const item of items) {
          if (!item.foodId || Number(item.quantity) <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
              status: 'fail', 
              message: 'Mỗi món ăn trong combo phải có số lượng lớn hơn 0.' 
            });
          }
        }
      }

      // Xóa tất cả items cũ
      await ComboItem.deleteMany({ comboId }, { session });

      // Thêm items mới
      if (items.length > 0) {
        const comboItems = items.map(item => ({
          comboId,
          foodId: item.foodId,
          quantity: Number(item.quantity)
        }));

        await ComboItem.insertMany(comboItems, { session });
      }
    }

    await session.commitTransaction();

    // Lấy combo với items mới để trả về
    const comboItemsData = await ComboItem.find({ comboId })
      .populate('foodId', 'name price images')
      .session(null);

    res.status(200).json({ 
      status: 'success', 
      data: {
        ...updatedCombo.toObject(),
        items: comboItemsData
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating combo:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  } finally {
    session.endSession();
  }
};

// Delete Combo và tất cả Items liên quan
exports.deleteCombo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const comboId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo không hợp lệ' });
    }

    // Xóa tất cả combo items trước
    await ComboItem.deleteMany({ comboId }, { session });

    // Xóa combo
    const deletedCombo = await Combo.findByIdAndDelete(comboId, { session });
    if (!deletedCombo) {
      await session.abortTransaction();
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo' });
    }

    await session.commitTransaction();
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ status: 'fail', message: error.message });
  } finally {
    session.endSession();
  }
};

// Xóa item khỏi combo
exports.removeItemFromCombo = async (req, res) => {
  try {
    const { comboId, itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(comboId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }

    const deletedItem = await ComboItem.findOneAndDelete({
      _id: itemId,
      comboId
    });

    if (!deletedItem) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy item trong combo' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};



 