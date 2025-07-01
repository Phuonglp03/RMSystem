const mongoose = require('mongoose');

// 🔧 Kết nối đúng với database bạn đang dùng
mongoose.connect('mongodb+srv://2003tranquy123:quy123@cluster0.cl0b0wh.mongodb.net/RMSystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tableOrderSchema = new mongoose.Schema({}, { strict: false }); // bỏ qua schema để test
const TableOrder = mongoose.model('TestTableOrder', tableOrderSchema, 'tableorders'); // ⚠️ Tên collection rõ ràng

async function testFind() {
  try {
    const id = '6857e62ec6f6635e387fc1f5'; // ← ID bạn xác nhận tồn tại
    const result = await TableOrder.findById(id);
    console.log('🔍 Kết quả tìm được:', result);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

testFind();
