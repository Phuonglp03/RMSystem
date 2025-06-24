
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  Code: {
    type: String,
    required: true,
   
  },
  Description: {
    type: String,
    required: false
  },
  Quality: {
    type: Number,
    required: true
  },
  Discount_Type: {
    type: String,
    required: true
  },
  Discount_Value: {
    type: String,
    required: true
  },
  Point_required: {
    type: Number,
    required: true
  },
  Valid_From: {
    type: Date,
    required: true
  },
  Valid_To: {
    type: Date,
    required: true
  },
  Created_At: {
    type: Date,
    default: Date.now
  },
  Updated_At: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coupon', CouponSchema); 
=======
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    couponName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percent', 'amount'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },
    usageLimit: {
      type: Number,
      default: 1,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableFor: {
      type: String,
      enum: ['all', 'new_customer', 'loyalty'],
      default: 'all'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

couponSchema.index({ couponCode: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired && this.usedCount < this.usageLimit;
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon; 

