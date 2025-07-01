const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');

exports.restockInventory = async (req, res) => {
  try {
    const { ingredientId, quantity, unitPrice, expiryDate } = req.body;
    const userId = req.user?._id || null; // nếu bạn dùng auth middleware

    if (!ingredientId || !quantity) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const existing = await Inventory.findOne({ ingredientId });

    if (existing) {
      // Đã có -> cập nhật số lượng và thông tin
      existing.currentQuantity += quantity;
      if (unitPrice !== undefined) existing.unitPrice = unitPrice;
      if (expiryDate) existing.expiryDate = expiryDate;
      existing.lastRestockedBy = userId;
      existing.lastRestockedDate = new Date();
      await existing.save();
      return res.status(200).json({ message: 'Đã cập nhật kho', data: existing });
    } else {
      // Chưa có -> tạo mới
      const newEntry = new Inventory({
        ingredientId,
        currentQuantity: quantity,
        unitPrice,
        expiryDate,
        lastRestockedBy: userId,
        lastRestockedDate: new Date()
      });

      await newEntry.save();
      return res.status(201).json({ message: 'Đã thêm mới vào kho', data: newEntry });
    }
  } catch (err) {
    console.error('❌ Lỗi nhập kho:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.getAllInventory = async (req, res) => {
  try {
    const list = await Inventory.find().populate('ingredientId');
    return res.status(200).json(list);
  } catch (err) {
    console.error('❌ Lỗi lấy dữ liệu kho:', err);
    return res.status(500).json({ message: 'Lỗi server khi lấy kho' });
  }
};


exports.createIngredientWithInventory = async (req, res) => {
  try {
    const { name, unit, categoryId, minimumThreshold = 0 } = req.body;

    if (!name || !unit) {
      return res.status(400).json({ message: 'Thiếu tên hoặc đơn vị nguyên liệu' });
    }

    // Kiểm tra trùng tên nguyên liệu
    const existingIngredient = await Ingredient.findOne({ name: name.trim() });
    if (existingIngredient) {
      return res.status(409).json({ message: 'Nguyên liệu đã tồn tại' });
    }

    // 1. Tạo nguyên liệu mới
    const newIngredient = new Ingredient({
      name: name.trim(),
      unit: unit.trim(),
      categoryId,
    });
    await newIngredient.save();

    // 2. Tạo inventory tương ứng
    const newInventory = new Inventory({
      ingredientId: newIngredient._id,
      currentQuantity: 0,
      minimumThreshold,
    });
    await newInventory.save();

    return res.status(201).json({
      message: '✅ Đã thêm nguyên liệu và tạo bản ghi kho',
      ingredient: newIngredient,
      inventory: newInventory,
    });
  } catch (err) {
    console.error('❌ Lỗi tạo nguyên liệu và kho:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.updateQuantity = async (req, res) => {
  const { ingredientId, currentQuantity } = req.body;

  try {
    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        ingredientId,
        currentQuantity,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy mục kho' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update inventory error:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật kho' });
  }
};