const TableOrder = require('../models/TableOrder');
const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Combo = require('../models/Combo');
const notificationService = require('../services/notificationService');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const Servant = require('../models/Servant');
const ComboItem = require('../models/ComboItem');

// Tạo nhiều TableOrder cho 1 user với cùng 1 bookingCode
exports.createTableOrders = async (req, res) => {
  try {
    const { bookingCode, orders } = req.body;
    // orders: [{ tableId, foods, combos, status }]
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
      return {
        ...order,
        bookingCode,
        totalprice: total,
        paymentStatus: 'pending',
        status: 'pending',
      };
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
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * limit;

    const query = {}
    if (status) {
      query.status = status;
    }

    //Truoc khi find, ta se auto update nhung order da het han thanh cancelled
    const now = new Date();
    await TableOrder.updateMany(
      {
        status: { $in: ['pending', 'confirmed', 'preparing'] },
        'completedAt': { $lt: now }
      },
      { $set: { status: 'cancelled' } }
    )
    const total = await TableOrder.countDocuments(query);
    const orders = await TableOrder.find()
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    ;
    res.status(200).json({
      status: 'success',
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      data: orders
    });
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
    console.log('userId param:', userId);

    const customer = await Customer.findOne({ userId });
    console.log('customer found:', customer);

    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy customer với userId này' });
    }

    console.log('customer._id:', customer._id, 'typeof:', typeof customer._id, 'instanceof ObjectId:', customer._id instanceof require('mongoose').Types.ObjectId);

    // Lấy một reservation mẫu để log kiểu dữ liệu customerId
    const oneReservation = await Reservation.findOne({});
    if (oneReservation) {
      console.log('Sample reservation customerId:', oneReservation.customerId, 'typeof:', typeof oneReservation.customerId[0], 'instanceof ObjectId:', oneReservation.customerId[0] instanceof require('mongoose').Types.ObjectId);
    }

    // Truy vấn match cả ObjectId lẫn string
    const reservations = await Reservation.find({
      $or: [
        { customerId: { $in: [customer._id] } },
        { customerId: { $in: [customer._id.toString()] } }
      ]
    }).select('_id');
    console.log('reservations found:', reservations);

    const reservationIds = reservations.map(r => r._id);
    const orders = await TableOrder.find({ reservationId: { $in: reservationIds } })
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity');
    console.log('orders found:', orders);

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    console.error('Error in getTableOrdersByUserId:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

exports.getTableOrdersByReservationId = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const orders = await TableOrder.find({ reservationId })
      .populate('tableId', 'tableNumber')
      .populate('foods.foodId', 'name price')
      .populate('combos', 'comboId foodId quantity')
      .populate({
        path: 'reservationId',
        populate: {
          path: 'customerId',
          populate: {
            path: 'userId',
            select: 'fullname email phone'
          }
        }
      });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thanh toán đơn đặt bàn
const payReservationOrders = async (req, res) => {
  try {
    const { reservationCode, method } = req.body;

    // Validate input
    if (!reservationCode || !['cash', 'momo', 'vnpay'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Thông tin thanh toán không hợp lệ.' });
    }

    // Tìm Reservation
    const reservation = await Reservation.findOne({ reservationCode });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn.' });
    }

    // Tìm tất cả các đơn theo reservationId
    const orders = await TableOrder.find({ reservationId: reservation._id });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Không có đơn nào để thanh toán.' });
    }

    // Tính tổng toàn bộ đơn
    const totalAmount = orders.reduce((sum, order) => sum + (order.totalprice || 0), 0);

    const now = new Date();

    // Cập nhật từng đơn
    for (const order of orders) {
      order.paymentStatus = 'success';
      order.paymentMethod = method;
      order.paidAt = now;
      await order.save();
    }

    // Cập nhật reservation
    reservation.paymentStatus = true;
    await reservation.save();

    return res.status(200).json({
      success: true,
      message: 'Thanh toán thành công!',
      data: {
        reservationCode,
        paymentMethod: method,
        totalAmount,
        paidAt: now,
      },
    });
  } catch (err) {
    console.error('Thanh toán lỗi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// Xác nhận thanh toán tiền mặt cho TableOrder
exports.confirmCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await TableOrder.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt món' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Chỉ xác nhận thanh toán cho đơn đã hoàn thành' });
    }
    if (order.paymentStatus === 'success') {
      return res.status(400).json({ success: false, message: 'Đơn đã được thanh toán trước đó' });
    }
    order.paymentStatus = 'success';
    order.paymentMethod = 'cash';
    order.paidAt = new Date();
    await order.save();
    return res.status(200).json({ success: true, message: 'Xác nhận thanh toán tiền mặt thành công', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Cập nhật đơn đặt món */
exports.servantUpdateTableOrder = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params

    const tableOrder = await TableOrder.findOne({ _id: orderId }).populate('reservationId')
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy TableOrder' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền sửa đơn này' });
    }
    const updateData = { ...req.body };
    const updatedOrder = await TableOrder.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true })
      .populate('foods.foodId', 'name price')
      .populate('tableId', 'tableNumber capacity')
      .populate('combos', 'comboId foodId quantity');

    const notiData = await notificationService.createTableOrderNotification({
      tableOrderId: updatedOrder._id,
      tableNumber: updatedOrder.tableId.tableNumber
    }, NOTIFICATION_TYPES.TABLE_ORDER_UPDATED_BY_SERVANT);
    await notificationService.addNotification(servantId, notiData);

    return res.json({
      status: 'success',
      message: 'Cập nhật đơn đặt món thành công',
      updatedOrder
    });

  } catch (error) {
    console.error('[DEBUG] Error in servantUpdateTableOrder:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

/* Gửi đơn đặt món cho Chef */
exports.servantSendTableOrderToChef = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy TableOrder' });
    }

    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền gửi đơn này' });
    }

    tableOrder.status = 'preparing'; //Gui toi cho chef
    await tableOrder.save();

    return res.json({
      status: 'success',
      message: 'Gửi đơn đặt món cho Chef thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in servantSendTableOrderToChef:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

/* Servant xoa don dat mon */
exports.servantDeleteTableOrder = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy TableOrder' });
    }

    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền xóa đơn này' });
    }

    await TableOrder.findByIdAndDelete(orderId);
    return res.status(204).json({ status: 'success', message: 'Xóa đơn đặt món thành công', tableOrder });

  } catch (error) {
    console.error('[DEBUG] Error in servantDeleteTableOrder:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

/* Cập nhật trạng thái từng món ăn */
exports.updateFoodItemStatusInTableOrder = async (req, res) => {
  try {
    const { orderId, foodId } = req.params;
    const { status } = req.body; // status: 'pending', 'preparing', 'ready_to_serve', 'served'
    const servantId = req.jwtDecode.id;
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId);
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đơn đặt món' });
    }

    const foodItem = tableOrder.foods.find(f => f.foodId.toString() === foodId);
    if (!foodItem) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy món ăn trong đơn đặt món này' });
    }

    // Cập nhật trạng thái món ăn
    foodItem.status = status;
    await tableOrder.save();

    return res.json({
      status: 'success',
      message: 'Cập nhật trạng thái món ăn thành công',
      tableOrder
    });

  } catch (error) {
    console.error('[DEBUG] Error in updateFoodItemStatusInTableOrder:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

/* Xóa một món ra khỏi tableOrder */
exports.deleteFoodItemFromTableOrder = async (req, res) => {
  try {
    const { orderId, foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const servantId = req.jwtDecode.id;
    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đơn đặt món' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền xóa món này' });
    }
    // Tìm món ăn trong foods
    const foodIndex = tableOrder.foods.findIndex(f => f.foodId.toString() === foodId);
    if (foodIndex === -1) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy món ăn trong đơn đặt món này' });
    }
    // Xóa món ăn
    tableOrder.foods.splice(foodIndex, 1);
    // Cập nhật lại totalprice
    tableOrder.totalprice = tableOrder.foods.reduce((total, f) => total + (f.quantity || 1) * (f.foodId?.price || 0), 0);
    await tableOrder.save();
    return res.json({
      status: 'success',
      message: 'Xóa món ăn khỏi đơn đặt món thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in deleteFoodItemFromTableOrder:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

/* Servant chuyển bàn cho khách */
exports.servantTransferTableOrderToCustomer = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id;
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đơn đặt món' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền chuyển đơn này' });
    }
    // Cập nhật trạng thái đơn đặt món
    tableOrder.status = 'ready_to_serve'; // Chuyển cho khách
    await tableOrder.save();
    // Gửi thông báo cho khách hàng
    const notiData = await notificationService.createTableOrderNotification({
      tableOrderId: tableOrder._id,
      tableNumber: tableOrder.tableId?.tableNumber
    }, NOTIFICATION_TYPES.TABLE_ORDER_TRANSFERRED_TO_CUSTOMER);
    await notificationService.addNotification(tableOrder.reservationId.customerId, notiData);
    return res.json({
      status: 'success',
      message: 'Chuyển đơn đặt món cho khách thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in servantTransferTableOrderToCustomer:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

/* Hoàn tất thanh toán */


/* Thống kê đặt món của servant */
exports.getTableOrderStats = async (req, res) => {
  try {
    const { type } = req.query;
    console.log('[DEBUG] type:', type);
    let { from, to } = req.query;
    console.log('[DEBUG] from:', from, 'to:', to);
    const servantId = req.jwtDecode.id;
    console.log('[DEBUG] servantId:', servantId);
    const today = new Date();
    let startDate, endDate;

    if (type) {
      switch (type) {
        case 'day':
          startDate = new Date(today.setHours(0, 0, 0, 0));
          endDate = new Date(today.setHours(23, 59, 59, 999));
          break;
        case 'week': {
          const first = today.getDate() - today.getDay();
          startDate = new Date(today.setDate(first));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
        default:
          return res.status(400).json({ success: false, message: 'Period không hợp lệ' });
      }
    } else if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      return res.status(400).json({ success: false, message: 'Thiếu startDate/endDate hoặc period' });
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày không hợp lệ' });
    }

    const servant = await Servant.findOne({ userId: servantId });
    if (!servant) {
      return res.status(404).json({ success: false, message: 'Servant không tồn tại' });
    }
    console.log('[DEBUG] servant found:', servant);
    const orders = await TableOrder.find({
      servantId: new mongoose.Types.ObjectId(servantId),
      createdAt: { $gte: startDate, $lte: endDate }
    }, { status: 1, totalprice: 1 });
    console.log('[DEBUG] orders found:', orders.length, 'orders:', orders);
    const totalOrders = orders.length;
    const statusCount = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready_to_serve: 0,
      served: 0,
      completed: 0,
      cancelled: 0
    };
    let totalRevenue = 0;

    for (const order of orders) {
      if (statusCount[order.status] !== undefined) {
        statusCount[order.status]++;
      }
      totalRevenue += order.totalprice || 0;
    }

    res.status(200).json({
      status: 'success',
      message: 'Thống kê table-order thành công',
      statistics: {
        type: type || 'custom',
        period: `${startDate.toISOString()} → ${endDate.toISOString()}`,
        totalOrders,
        totalRevenue,
        ...statusCount
      }
    });
  } catch (err) {
    console.error('[DEBUG] Error in getTableOrderStats:', err);
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// API cho chef: chuyển trạng thái TableOrder sang completed
exports.chefCompleteTableOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'fail', message: 'ID không hợp lệ' });
    }
    const order = await TableOrder.findById(id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy TableOrder' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ status: 'fail', message: 'Chỉ có thể hoàn thành đơn ở trạng thái pending' });
    }
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// API cho chef: lấy danh sách đơn pending, kèm chi tiết combo
exports.chefGetPendingOrders = async (req, res) => {
  try {
    const orders = await TableOrder.find({ status: 'pending' })
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('foods.foodId', 'name price')
      .populate({
        path: 'combos',
        select: 'name',
      });

  
    for (const order of orders) {
      for (const combo of order.combos) {
        const items = await ComboItem.find({ comboId: combo._id })
          .populate('foodId', 'name');
        combo.items = items;
      }
    }
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      combos: order.combos.map(combo => ({
        _id: combo._id,
        name: combo.name,
        items: combo.items 
      }))
    }));
    res.status(200).json({ status: 'success', data: formattedOrders });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

