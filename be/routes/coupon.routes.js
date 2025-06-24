const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');

// Lấy tất cả coupon
router.get('/', couponController.getAllCoupons);

// Đổi điểm lấy coupon
router.post('/redeem', couponController.redeemCoupon);

// Thêm mới coupon
router.post('/', couponController.addCoupon);

module.exports = router; 