const Coupon = require('../models/Coupon');
const Customer = require('../models/Customer');

// Lấy tất cả coupon
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đổi điểm lấy coupon
exports.redeemCoupon = async (req, res) => {
  try {
    const { userId, couponId } = req.body;
    // Tìm customer theo userId (user._id)
    const customer = await Customer.findOne({ userId });
    const coupon = await Coupon.findById(couponId);
    if (!customer || !coupon) {
      return res.status(404).json({ message: 'User or Coupon not found' });
    }
    if (customer.points < coupon.Point_required) {
      return res.status(400).json({ message: 'Not enough points' });
    }
    // Trừ điểm và thêm coupon vào user
    customer.points -= coupon.Point_required;
    customer.coupons.push(coupon._id);
    await customer.save();
    res.status(200).json({ message: 'Coupon redeemed successfully', user: customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm mới coupon
exports.addCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Coupon code already exists' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
}; 