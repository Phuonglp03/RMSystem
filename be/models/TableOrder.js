const mongoose = require('mongoose');

const tableOrderSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'ID bàn ăn là bắt buộc'],
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    servantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    foods: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
          required: true
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    combos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combo', // Đổi từ 'ComboItem' sang 'Combo' để khớp với dữ liệu gửi lên
      },
    ],
    status: {
      type: String,
      required: true,
      enum: [
        'pending',        // Mới tạo, chờ xác nhận
        'confirmed',      // Đã xác nhận, chờ chuẩn bị
        'preparing',      // Đang chuẩn bị
        'ready_to_serve', // Sẵn sàng phục vụ
        'served',         // Đã phục vụ
        'completed',      // Hoàn thành (có thể bao gồm đã thanh toán)
        'cancelled',      // Đã hủy
      ],
      default: 'pending',
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    totalprice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paymentMethod: { type: String, enum: ['cash', 'momo', 'vnpay', 'payos'], default: null },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    paidAt: Date,
    order_payment_id: { type: String, index: true }, // Bỏ unique: true để tránh lỗi duplicate key khi null hoặc trùng
  },
  {
    timestamps: true,
  }
);


const TableOrder = mongoose.model('TableOrder', tableOrderSchema);

module.exports = TableOrder;