const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const TableOrder = require('../models/TableOrder');




// GET /api/table-orders
router.get('/', async (req, res) => {
  const orders = await TableOrder.find()
    .populate('tableId') // lấy thông tin bàn
    .populate('foods.foodId') // nếu muốn lấy tên món
    .sort({ createdAt: -1 });

  res.json(orders);
});




router.post('/:id/complete', async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    console.log('🔧 Gọi hoàn thành đơn với ID:', id);

    const order = await TableOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ message: 'Đơn hàng đã hoàn thành' });
    }

    // ✅ Cập nhật đúng cách
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save(); // Không tạo mới, chỉ lưu

    console.log('✅ Đã hoàn thành đơn:', order._id);
    res.json({ message: 'Đã hoàn thành đơn', order });
  } catch (err) {
    console.error('❌ Lỗi backend:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
