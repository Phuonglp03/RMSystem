const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');

// COMBO ROUTES
// Tạo combo mới (có upload nhiều ảnh và items)
router.post('/', comboController.upload.array('images'), comboController.createCombo);

// Lấy tất cả combo với items
router.get('/', comboController.getAllCombos);

// Lấy combo theo ID với items
router.get('/:id', comboController.getComboById);

// Cập nhật combo (có upload nhiều ảnh và items)
router.put('/:id', comboController.upload.array('images'), comboController.updateCombo);

// Xóa combo và tất cả items liên quan
router.delete('/:id', comboController.deleteCombo);

// Xóa item khỏi combo
router.delete('/:comboId/items/:itemId', comboController.removeItemFromCombo);

module.exports = router; 