const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');

// Tạo combo (có upload ảnh)
router.post('/', comboController.upload.single('image'), comboController.createCombo);
// Lấy tất cả combo
router.get('/', comboController.getAllCombos);
// Lấy combo theo ID
router.get('/:id', comboController.getComboById);
// Cập nhật combo (có upload ảnh)
router.put('/:id', comboController.upload.single('image'), comboController.updateCombo);
// Xóa combo
router.delete('/:id', comboController.deleteCombo);

module.exports = router; 