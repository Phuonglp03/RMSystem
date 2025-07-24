const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

// Lấy tất cả coupon
router.get('/', couponController.getAllCoupons);

// Lấy coupon theo ID
router.get('/:id', couponController.getCouponById);

// Thêm mới coupon
router.post('/', couponController.addCoupon);

// Cập nhật coupon
router.put('/:id', couponController.updateCoupon);

// Xóa coupon
router.delete('/:id', couponController.deleteCoupon);

// Áp dụng coupon vào đơn hàng
router.post('/apply', authMiddleware, couponController.applyCoupon);

module.exports = router; 