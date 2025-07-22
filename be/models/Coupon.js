const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    coupon_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    coupon_name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discount_type: {
      type: String,
      enum: ['percent', 'amount'],
      required: true
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          if (this.discount_type === 'percent') {
            return value <= 100;
          }
          return true;
        },
        message: 'Discount value for percent type cannot exceed 100%'
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    point_required: {
      type: Number,
      default: 0,
      min: 0
    },
    valid_from: {
      type: Date,
      default: Date.now
    },
    valid_to: {
      type: Date,
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
    },
    applicable_for: {
      type: String,
      enum: ['all', 'new_customer', 'loyalty'],
      default: 'all'
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

couponSchema.index({ coupon_code: 1 });
couponSchema.index({ valid_from: 1, valid_to: 1 });
couponSchema.index({ is_active: 1 });

couponSchema.virtual('is_expired').get(function() {
  return new Date() > this.valid_to;
});

couponSchema.virtual('is_valid').get(function() {
  return this.is_active && !this.is_expired && this.quantity > 0;
});

couponSchema.pre('save', function(next) {
  if (this.discount_type === 'percent' && this.discount_value > 100) {
    return next(new Error('Discount value for percent type cannot exceed 100%'));
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon; 