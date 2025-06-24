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