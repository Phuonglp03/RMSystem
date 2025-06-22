const ComboItem = require('../models/ComboItem');
const mongoose = require('mongoose');

// Create ComboItem
exports.createComboItem = async (req, res) => {
  try {
    const { comboId, foodId, quantity } = req.body;
    const comboItem = new ComboItem({ comboId, foodId, quantity });
    const savedComboItem = await comboItem.save();
    res.status(201).json({ status: 'success', data: savedComboItem });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Get all ComboItems
exports.getAllComboItems = async (req, res) => {
  try {
    const comboItems = await ComboItem.find()
      .populate('comboId', 'name')
      .populate('foodId', 'name');
    res.status(200).json({ status: 'success', results: comboItems.length, data: comboItems });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Get ComboItem by ID
exports.getComboItemById = async (req, res) => {
  try {
    const comboItemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboItemId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo item không hợp lệ' });
    }
    const comboItem = await ComboItem.findById(comboItemId)
      .populate('comboId', 'name')
      .populate('foodId', 'name');
    if (!comboItem) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo item' });
    }
    res.status(200).json({ status: 'success', data: comboItem });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update ComboItem
exports.updateComboItem = async (req, res) => {
  try {
    const comboItemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboItemId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo item không hợp lệ' });
    }
    const updateData = { ...req.body };
    const updatedComboItem = await ComboItem.findByIdAndUpdate(comboItemId, updateData, { new: true, runValidators: true })
      .populate('comboId', 'name')
      .populate('foodId', 'name');
    if (!updatedComboItem) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo item' });
    }
    res.status(200).json({ status: 'success', data: updatedComboItem });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete ComboItem
exports.deleteComboItem = async (req, res) => {
  try {
    const comboItemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(comboItemId)) {
      return res.status(400).json({ status: 'fail', message: 'ID combo item không hợp lệ' });
    }
    const deletedComboItem = await ComboItem.findByIdAndDelete(comboItemId);
    if (!deletedComboItem) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy combo item' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
}; 