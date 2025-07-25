const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminOnly, staffOnly } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh-token', userController.refreshToken);

// Protected routes - All authenticated users
router.get('/profile', authMiddleware, userController.getProfile);

// New profile routes
router.get('/:userId/profile', authMiddleware, userController.getUserProfile);
router.put('/:userId/profile', authMiddleware, userController.updateUserProfile);
router.get('/:userId/loyalty', authMiddleware, userController.getLoyaltyInfo);
router.get('/:userId/coupons', authMiddleware, userController.getUserCoupons);
router.post('/:userId/redeem-coupon', authMiddleware, userController.redeemCoupon);

// Admin only routes
router.get('/all', authMiddleware, adminOnly, userController.getAllUsers);

// Staff routes (admin, chef, servant)
router.get('/staff', authMiddleware, staffOnly, userController.getStaffUsers);

module.exports = router; 