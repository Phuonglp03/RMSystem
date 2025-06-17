const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servant',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

// Cân nhắc thêm một pre-save hook để tự động đặt publishedAt khi published thay đổi thành true
blogSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (this.isModified('published') && !this.published) {
    // Tùy chọn: Xóa publishedAt nếu bài viết bị hủy xuất bản
    // this.publishedAt = null;
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;