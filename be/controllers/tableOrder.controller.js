const TableOrder = require('../models/TableOrder');
const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Combo = require('../models/Combo');

// Tạo nhiều TableOrder cho 1 user với cùng 1 bookingCode
exports.createTableOrders = async (req, res) => {
  try {
    const { bookingCode, orders } = req.body;
    // orders: [{ tableId, reservationId, foods, combos, status }]
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'orders phải là mảng và không được rỗng' });
    }
    // Lấy danh sách food và combo để tính giá
    const foodDocs = await Food.find({});
    const foodPriceMap = {};
    foodDocs.forEach(f => { foodPriceMap[f._id.toString()] = f.price; });
    const comboDocs = await Combo.find({});
    const comboPriceMap = {};
    comboDocs.forEach(c => { comboPriceMap[c._id.toString()] = c.price; });
    // Tính totalprice cho từng order
    const ordersWithPrice = orders.map(order => {
      let total = 0;
      if (order.foods && Array.isArray(order.foods)) {
        order.foods.forEach(f => {
          const price = foodPriceMap[f.foodId] || 0;
          total += price * (f.quantity || 1);
        });
      }
      if (order.combos && Array.isArray(order.combos)) {
        order.combos.forEach(cid => {
          const price = comboPriceMap[cid] || 0;
          total += price;
        });
      }
      return { ...order, bookingCode, totalprice: total };
    });
    const createdOrders = await TableOrder.insertMany(ordersWithPrice);
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
    let updateData = { ...req.body };
    // Nếu có cập nhật foods hoặc combos thì tính lại totalprice
    if (updateData.foods || updateData.combos) {
      const foodDocs = await Food.find({});
      const foodPriceMap = {};
      foodDocs.forEach(f => { foodPriceMap[f._id.toString()] = f.price; });
      const comboDocs = await Combo.find({});
      const comboPriceMap = {};
      comboDocs.forEach(c => { comboPriceMap[c._id.toString()] = c.price; });
      let total = 0;
      if (updateData.foods && Array.isArray(updateData.foods)) {
        updateData.foods.forEach(f => {
          const price = foodPriceMap[f.foodId] || 0;
          total += price * (f.quantity || 1);
        });
      }
      if (updateData.combos && Array.isArray(updateData.combos)) {
        updateData.combos.forEach(cid => {
          const price = comboPriceMap[cid] || 0;
          total += price;
        });
      }
      updateData.totalprice = total;
    }
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


exports.getReservationByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const reservation = await Reservation.findOne({ reservationCode: code }).populate('bookedTable', 'tableNumber capacity status');
    if (!reservation) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy reservation với code này' });
    }
    res.status(200).json({ status: 'success', data: reservation });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Lấy danh sách TableOrder theo userId (truy ngược sang Customer)
exports.getTableOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('userId:', userId);
    const customer = await Customer.findOne({ userId });
    console.log('customer:', customer);
    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy customer với userId này' });
    }
    const reservations = await Reservation.find({ customerId: customer._id }).select('_id');
    console.log('reservations:', reservations);
    const reservationIds = reservations.map(r => r._id);
    const orders = await TableOrder.find({ reservationId: { $in: reservationIds } })
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    console.log('orders:', orders);
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    console.error('Error in getTableOrdersByUserId:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}; 