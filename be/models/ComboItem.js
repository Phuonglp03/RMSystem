const mongoose = require('mongoose');

const comboItemSchema = new mongoose.Schema(
  {
    comboId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Combo',
      required: [true, 'Combo ID là bắt buộc'],
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: [true, 'Food ID là bắt buộc'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải ít nhất là 1'],
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index để tăng hiệu suất query
comboItemSchema.index({ comboId: 1 });
comboItemSchema.index({ foodId: 1 });

// Đảm bảo một food chỉ xuất hiện một lần trong mỗi combo
comboItemSchema.index({ comboId: 1, foodId: 1 }, { unique: true });

const ComboItem = mongoose.model('ComboItem', comboItemSchema);

module.exports = ComboItem; 