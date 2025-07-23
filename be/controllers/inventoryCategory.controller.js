const Category = require('../models/IngredientCategory');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: 'Danh mục đã tồn tại' });

    const newCat = new Category({ name: name.trim() });
    await newCat.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', data: newCat });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh mục' });
  }
};
