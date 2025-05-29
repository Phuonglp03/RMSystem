import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String, // Ví dụ: 'new_order', 'system_update', 'mention', etc.
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Trường "Related_At" trong sơ đồ có kiểu Object_id,
    // điều này gợi ý nó là ID của một thực thể liên quan đến thông báo này
    // (ví dụ: ID của đơn hàng, ID của bình luận, etc.)
    // Tôi sẽ đặt tên là relatedEntityId cho rõ ràng.
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: 'SomeOtherModel' // Bạn có thể thêm ref ở đây nếu biết nó luôn trỏ tới một model cụ thể
      // Hoặc sử dụng refPath nếu nó có thể trỏ đến nhiều model khác nhau:
      // refPath: 'onModel'
    },
    // onModel: { // Đi kèm với refPath nếu bạn chọn cách đó
    //   type: String,
    //   required: function() { return !!this.relatedEntityId; }, // Bắt buộc nếu relatedEntityId tồn tại
    //   enum: ['Order', 'Post', 'Comment'] // Liệt kê các model có thể liên quan
    // },

    // Sơ đồ có trường "Created_At". Tùy chọn timestamps: true sẽ tự động tạo ra
    // trường "createdAt" (và "updatedAt").
    // Nếu bạn muốn tên chính xác là "Created_At", bạn có thể định nghĩa tường minh:
    // Created_At: {
    //   type: Date,
    //   default: Date.now
    // }
    // Tuy nhiên, sử dụng timestamps của Mongoose thường tiện lợi hơn.
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
                      // createdAt sẽ khớp với Created_At trong sơ đồ của bạn.
  }
);

// Model User của bạn đã có trường notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
// Điều này có nghĩa là mỗi User sẽ lưu một mảng các ID của các document Notification.
// Model Notification này không cần lưu trực tiếp userId nếu theo đúng sơ đồ chỉ có mối quan hệ một chiều từ User.

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;