const express = require('express');
const router = express.Router();
const comboController = require('../controllers/combo.controller');

// COMBO ROUTES
// Tạo combo mới (có upload ảnh và items)
router.post('/', comboController.upload.single('image'), comboController.createCombo);

// Lấy tất cả combo với items
router.get('/', comboController.getAllCombos);

// Cập nhật combo (có upload ảnh và items)
router.put('/:id', comboController.upload.single('image'), comboController.updateCombo);

// Xóa combo và tất cả items liên quan
router.delete('/:id', comboController.deleteCombo);

// Xóa item khỏi combo
router.delete('/:comboId/items/:itemId', comboController.removeItemFromCombo);

module.exports = router; 