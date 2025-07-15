const mongoose = require('mongoose');
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...', process.env.MONGO_URI);

  } catch (err) {
    console.error(err.message);
    try {
      // Fallback: Kết nối local nếu Atlas lỗi
      await mongoose.connect(process.env.MONGO_URI_LOCAL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to local MongoDB:', process.env.MONGO_URI_LOCAL);
    } catch (localErr) {
      console.error('❌ Failed to connect to local MongoDB as well.', localErr.message);
      process.exit(1); // Thoát nếu cả 2 đều lỗi
    }
  }
};

module.exports = connectDB;