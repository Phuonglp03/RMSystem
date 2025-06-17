const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Số bàn là bắt buộc'],
      unique: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Sức chứa của bàn là bắt buộc'],
      min: [1, 'Sức chứa phải ít nhất là 1 người'],
    },

    status: {
      type: Boolean,
      required: true,
      default: true, // Mặc định là bàn trống/sẵn có
    },
    currentReservation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
      },
    ],
    // Bạn có thể muốn thêm các trường khác như vị trí (ví dụ: 'gần cửa sổ', 'trong phòng VIP')
    // locationDescription: {
    //   type: String,
    //   trim: true
    // }
  },
  {
    timestamps: true,
  }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;