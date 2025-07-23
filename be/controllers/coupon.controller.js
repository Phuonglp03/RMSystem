const Coupon = require('../models/Coupon');
const TableOrder = require('../models/TableOrder');
const Customer = require('../models/Customer');


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

// Áp dụng coupon vào đơn hàng
exports.applyCoupon = async (req, res) => {
  try {
    const { orderId, couponCode } = req.body;
    const userId = req.jwtDecode?.id;

    if (!orderId || !couponCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin đơn hàng hoặc mã giảm giá' 
      });
    }

    // Tìm đơn hàng
    const order = await TableOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Kiểm tra đơn hàng đã thanh toán chưa
    if (order.paymentStatus === 'success') {
      return res.status(400).json({ 
        success: false, 
        message: 'Đơn hàng đã thanh toán, không thể áp dụng mã giảm giá' 
      });
    }

    // Tìm coupon
    const coupon = await Coupon.findOne({ coupon_code: couponCode });
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy mã giảm giá' 
      });
    }

    // Kiểm tra coupon có hợp lệ không
    const currentDate = new Date();
    if (!coupon.is_active || currentDate > coupon.valid_to || currentDate < coupon.valid_from || coupon.quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Kiểm tra xem người dùng có sở hữu coupon này không (nếu là coupon cần đổi điểm)
    if (coupon.point_required > 0 && userId) {
      const customer = await Customer.findOne({ userId }).populate('coupons');
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy thông tin khách hàng' 
        });
      }

      const hasCoupon = customer.coupons.some(c => 
        c._id.toString() === coupon._id.toString()
      );

      if (!hasCoupon) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không sở hữu mã giảm giá này' 
        });
      }
    }

    // Tính giá trị giảm giá
    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
      discountAmount = (order.totalprice * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }

    // Cập nhật đơn hàng
    const originalPrice = order.totalprice;
    const discountedPrice = Math.max(0, originalPrice - discountAmount);
    
    order.couponApplied = coupon._id;
    order.discountAmount = discountAmount;
    order.originalPrice = originalPrice;
    order.totalprice = discountedPrice;
    
    await order.save();

    // Giảm số lượng coupon
    coupon.quantity -= 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Áp dụng mã giảm giá thành công',
      data: {
        order,
        discount: {
          originalPrice,
          discountAmount,
          finalPrice: discountedPrice
        }
      }
    });
  } catch (err) {
    console.error('Apply coupon error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi áp dụng mã giảm giá',
      error: err.message
    });
  }
}; 