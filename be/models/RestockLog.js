const mongoose = require('mongoose');

const restockLogSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: [true, 'ID Nguyên liệu là bắt buộc'],
    },
    restockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, 'Người nhập kho là bắt buộc'],
    },
    quantityAdded: {
      type: Number,
      required: [true, 'Số lượng nhập thêm là bắt buộc'],
      min: [0.001, 'Số lượng nhập thêm phải lớn hơn 0'], 
    },

    restockDate: {
      type: Date,
      required: [true, 'Ngày nhập kho là bắt buộc'],
      default: Date.now, 
    },
    note: {
      type: String,
      trim: true,
    },
   
  },
  {
    timestamps: true, 

  }
);

const RestockLog = mongoose.model('RestockLog', restockLogSchema);

module.exports = RestockLog;