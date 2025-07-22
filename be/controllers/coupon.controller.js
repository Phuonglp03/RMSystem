const Coupon = require('../models/Coupon');


// Lấy tất cả coupon
exports.getAllCoupons = async (req, res) => {
  try {
    const currentDate = new Date();
    const coupons = await Coupon.find({
      applicable_for: 'all',
      is_active: true,
      valid_to: { $gte: currentDate },
      quantity: { $gt: 0 }
    });
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Thêm mới coupon
exports.addCoupon = async (req, res) => {
  try {
    // Validate percent discount value
    if (req.body.discount_type === 'percent' && req.body.discount_value > 100) {
      return res.status(400).json({ message: 'Discount value for percent type cannot exceed 100%' });
    }
    
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

// Cập nhật coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate percent discount value
    if (req.body.discount_type === 'percent' && req.body.discount_value > 100) {
      return res.status(400).json({ message: 'Discount value for percent type cannot exceed 100%' });
    }
    
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.status(200).json({ message: 'Coupon updated successfully', coupon });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Coupon code already exists' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

// Xóa coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy coupon theo ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 