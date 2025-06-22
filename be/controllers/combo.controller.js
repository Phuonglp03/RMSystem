const Combo = require('../models/Combo');
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

// Create Combo
exports.createCombo = async (req, res) => {
  try {
    const { name, description, price, isActive, quantity } = req.body;
    let image = '';
    if (req.file) {
      const urls = await uploadImages([req.file], 'combos');
      image = urls[0];
    }
    const combo = new Combo({ name, description, price, isActive, quantity, image });
    const savedCombo = await combo.save();
    res.status(201).json({ status: 'success', data: savedCombo });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Get all Combos
exports.getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.find();
    res.status(200).json({ status: 'success', results: combos.length, data: combos });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Get Combo by ID
exports.getComboById = async (req, res) => {
  try {
    const comboId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo không hợp lệ' });
    }
    const combo = await Combo.findById(comboId);
    if (!combo) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo' });
    }
    res.status(200).json({ status: 'success', data: combo });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update Combo
exports.updateCombo = async (req, res) => {
  try {
    const comboId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo không hợp lệ' });
    }
    const updateData = { ...req.body };
    if (req.file) {
      const urls = await uploadImages([req.file], 'combos');
      updateData.image = urls[0];
    }
    const updatedCombo = await Combo.findByIdAndUpdate(comboId, updateData, { new: true, runValidators: true });
    if (!updatedCombo) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo' });
    }
    res.status(200).json({ status: 'success', data: updatedCombo });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete Combo
exports.deleteCombo = async (req, res) => {
  try {
    const comboId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo không hợp lệ' });
    }
    const deletedCombo = await Combo.findByIdAndDelete(comboId);
    if (!deletedCombo) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
}; 