const TableOrder = require('../models/TableOrder');
const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Tạo nhiều TableOrder cho 1 user với cùng 1 bookingCode
exports.createTableOrders = async (req, res) => {
  try {
    const { bookingCode, orders } = req.body;
    // orders: [{ tableId, reservationId, foods, combos, status }]
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'orders phải là mảng và không được rỗng' });
    }
    const createdOrders = await TableOrder.insertMany(
      orders.map(order => ({ ...order, bookingCode }))
    );
    res.status(201).json({ status: 'success', data: createdOrders });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Lấy tất cả TableOrder
exports.getAllTableOrders = async (req, res) => {
  try {
    const orders = await TableOrder.find()
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    res.status(200).json({ status: 'success', results: orders.length, data: orders });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Lấy TableOrder theo ID
exports.getTableOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const order = await TableOrder.findById(orderId)
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy order' });
    }
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Cập nhật TableOrder (chọn bàn, cập nhật món ăn, combo)
exports.updateTableOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const updateData = { ...req.body };
    const updatedOrder = await TableOrder.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true })
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    if (!updatedOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy order' });
    }
    res.status(200).json({ status: 'success', data: updatedOrder });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Xóa TableOrder
exports.deleteTableOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const deletedOrder = await TableOrder.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy order' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};




// Lấy danh sách TableOrder theo userId (truy ngược sang Customer)
exports.getTableOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[DEBUG] userId:', userId);
    const customer = await Customer.findOne({ userId });
    console.log('[DEBUG] customer:', customer);
    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy customer với userId này' });
    }
    const reservations = await Reservation.find({ customerId: { $in: [customer._id] } }).select('_id customerId');
    console.log('[DEBUG] reservations:', reservations);
    const reservationIds = reservations.map(r => r._id);
    console.log('[DEBUG] reservationIds:', reservationIds);
    const orders = await TableOrder.find({ reservationId: { $in: reservationIds } })
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    console.log('[DEBUG] orders:', orders);

    // Group orders by reservationId
    const grouped = {};
    orders.forEach(order => {
      const rid = order.reservationId?._id?.toString() || order.reservationId?.toString();
      if (!grouped[rid]) {
        grouped[rid] = {
          reservationId: rid,
          reservationInfo: order.reservationId,
          orders: []
        };
      }
      grouped[rid].orders.push(order);
    });
    const result = Object.values(grouped);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('[DEBUG] Error in getTableOrdersByUserId:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}; 