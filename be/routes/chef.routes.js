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

    // ✅ Cập nhật trạng thái mà không validate toàn bộ schema
    const updatedOrder = await TableOrder.findByIdAndUpdate(
      id,
      {
        paymentStatus: 'completed',
        completedAt: new Date()
      },
      {
        new: true,
        runValidators: false // ⛔ Không validate userId nữa
      }
    );

    console.log('✅ Đã hoàn thành đơn:', updatedOrder._id);
    res.json({ message: 'Đã hoàn thành đơn', order: updatedOrder });
  } catch (err) {
    console.error('❌ Lỗi backend:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/table-orders/:id/payment-status
router.post('/:id/payment-status', async (req, res) => {
  try {
    const id = req.params.id;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    if (!paymentStatus) {
      return res.status(400).json({ message: 'Thiếu thông tin paymentStatus' });
    }

    const updatedOrder = await TableOrder.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    console.log('💳 Đã cập nhật paymentStatus:', updatedOrder._id, paymentStatus);
    res.json({ message: 'Cập nhật trạng thái thanh toán thành công', order: updatedOrder });
  } catch (err) {
    console.error('❌ Lỗi cập nhật paymentStatus:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.post('/:id/update-payment-status', async (req, res) => {
  try {
    const id = req.params.id;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    if (!paymentStatus) {
      return res.status(400).json({ message: 'Thiếu trạng thái thanh toán' });
    }

    const updatedOrder = await TableOrder.findByIdAndUpdate(
      id,
      { paymentStatus,
        paidAt: new Date()
       },

      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ message: 'Cập nhật trạng thái thanh toán thành công', order: updatedOrder });
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});




module.exports = router;
