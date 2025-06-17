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

  },
  {
    timestamps: true,
  }
);


const TableOrder = mongoose.model('TableOrder', tableOrderSchema);

module.exports = TableOrder;