import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: [true, 'ID Nguyên liệu là bắt buộc'],
      unique: true, 
    },
    currentQuantity: {
      type: Number,
      required: [true, 'Số lượng hiện tại là bắt buộc'],
      default: 0,
      min: [0, 'Số lượng không thể âm'],
    },
    minimumThreshold: {
      type: Number, 
      default: 0,
      min: [0, 'Ngưỡng tối thiểu không thể âm'],
    },
    unitPrice: {
      type: Number, 
      min: [0, 'Đơn giá không thể âm'],
      
    },
    expiryDate: {
      type: Date, 
    },
    lastRestockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User (hoặc Servant nếu nhân viên làm việc này) đã nhập kho lần cuối
      // required: true, // Cân nhắc có bắt buộc hay không
    },
    lastRestockedDate: {
      type: Date, // Ngày nhập kho lần cuối
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;