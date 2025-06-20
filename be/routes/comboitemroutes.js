const express = require('express');
const router = express.Router();
const comboItemController = require('../controllers/comboItemController');

// Tạo combo item
router.post('/', comboItemController.createComboItem);
// Lấy tất cả combo item
router.get('/', comboItemController.getAllComboItems);
// Lấy combo item theo ID
router.get('/:id', comboItemController.getComboItemById);
// Cập nhật combo item
router.put('/:id', comboItemController.updateComboItem);
// Xóa combo item
router.delete('/:id', comboItemController.deleteComboItem);

module.exports = router; 