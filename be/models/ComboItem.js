import mongoose from 'mongoose';

const comboItemSchema = new mongoose.Schema(
  {

    comboId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Combo', 
      },
    ],

    foodId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food', 
      },
    ],
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

const ComboItem = mongoose.model('ComboItem', comboItemSchema);

export default ComboItem; 