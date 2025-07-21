const TableOrder = require('../models/TableOrder');
const Reservation = require('../models/Reservation');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Combo = require('../models/Combo');
const notificationService = require('../services/notificationService');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

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

/* Servant quản lý table order */
/* Nhận đơn đặt món từ customer, theo đơn đặt bàn do servant quản lý */
exports.getTableOrderFromCustomerByReservationCode = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { reservationCode } = req.body
    const reservation = await Reservation.findOne({ reservationCode })
      .populate('bookedTable', 'tableNumber capacity status')

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đặt bàn với mã ${reservationCode}`
      })
    }

    const tableOrder = await TableOrder.find({ reservationId: reservation._id })
      .populate({
        path: 'foods.foodId',
        select: 'name price'
      })
      .populate({
        path: 'tableId',
        select: 'tableNumber capacity'
      })
      .populate({
        path: 'combos',
        select: 'comboId foodId quantity'
      });

    return res.json({
      status: true,
      message: `Lấy danh sách đặt món theo ${reservationCode} thành công`,
      tableOrder,
      reservation
    })


  } catch (error) {
    console.error('[DEBUG] Error in getTableOrderFromCustomerByReservationCode:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Xác nhận đơn đặt món của khách */
exports.servantConfirmTableOrder = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }
    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy đơn đặt món' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền xác nhận đơn này' });
    }
    // Cập nhật trạng thái đơn đặt món
    tableOrder.status = 'confirmed'; // Xác nhận đơn
    await tableOrder.save();
    return res.json({
      status: true,
      message: 'Xác nhận đơn đặt món thành công',
      tableOrder
    });

  } catch (error) {
    console.error('[DEBUG] Error in servantConfirmTableOrder:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Đơn đặt bàn của tôi (servant) */
exports.servantGetAllTableOrders = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id;
    console.log('[DEBUG] servantId:', servantId);
    console.log('[DEBUG] req.headers.authorization:', req.headers.authorization)

    // Lấy query params
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query condition
    const query = { servantId };
    if (status) {
      query.status = status;
    }

    // Đếm tổng số documents (cho phân trang)
    const totalDocs = await TableOrder.countDocuments(query);
    console.log('[DEBUG] totalDocs:', totalDocs);
    // Tìm orders
    const orders = await TableOrder.find(query)
      .populate('tableId', 'tableNumber')
      .populate('reservationId')
      .populate('servantId', '_id fullname email phone')
      .populate('foods.foodId', 'name')
      .populate('combos', 'comboId foodId quantity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log('[DEBUG] orders:', orders);
    // Format lại dữ liệu trả về
    const formattedOrders = orders.map(order => ({
      id: order._id,
      table: {
        id: order.tableId?._id,
        number: order.tableId?.tableNumber
      },
      reservationId: order.reservationId?._id,
      servant: order.servantId ? {
        id: order.servantId._id,
        name: order.servantId.fullname,
        email: order.servantId.email,
        phone: order.servantId.phone
      } : null,
      status: order.status,
      totalItems: (order.foods?.length || 0) + (order.combos?.length || 0),
      foods: order.foods?.map(f => ({
        id: f.foodId?._id,
        name: f.foodId?.name,
        quantity: f.quantity
      })),
      combos: order.combos?.map(c => ({
        id: c._id,
        comboId: c.comboId,
        foodId: c.foodId,
        quantity: c.quantity
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.status(200).json({
      status: 'success',
      totalItems: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      currentPage: page,
      pageSize: limit,
      data: formattedOrders
    });

  } catch (error) {
    console.error('[DEBUG] Error in servantGetAllTableOrders:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};


/* Tạo đơn đặt món cho customer */
exports.servantCreateTableOrderForCustomer = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id;
    const { reservationCode, orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'orders phải là mảng và không được rỗng'
      });
    }

    const reservation = await Reservation.findOne({ reservationCode, servantId });
    if (!reservation) {
      return res.status(404).json({
        status: false,
        message: `Không tìm thấy đặt bàn với mã ${reservationCode}`
      });
    }

    const createdOrders = [];
    let globalTotal = 0; // Tổng tất cả đơn cho cùng 1 reservation

    for (const order of orders) {
      let total = 0;

      // Tính tiền món ăn
      if (order.foods && order.foods.length > 0) {
        for (const item of order.foods) {
          const food = await Food.findById(item.foodId);
          if (!food) continue;
          const qty = item.quantity || 1;
          total += food.price * qty;
        }
      }

      // Tính tiền combo
      if (order.combos && order.combos.length > 0) {
        for (const comboId of order.combos) {
          const combo = await Combo.findById(comboId);
          if (!combo) continue;
          total += combo.price; // Nếu combo có quantity, cần nhân thêm
        }
      }

      globalTotal += total;

      const newOrder = await TableOrder.create({
        ...order,
        reservationId: reservation._id,
        status: 'preparing',
        servantId,
        totalprice: total // lưu tạm subtotal
      });

      createdOrders.push(newOrder);

      const notiData = await notificationService.createTableOrderNotification({
        tableOrderId: newOrder._id,
        tableNumber: order.tableId
      }, NOTIFICATION_TYPES.TABLE_ORDER_CREATED_BY_SERVANT);

      await notificationService.addNotification(servantId, notiData);
    }

    // ✅ Gán totalPrice cuối cùng vào tất cả đơn cùng reservationId (gợi ý cho thanh toán)
    await TableOrder.updateMany(
      { reservationId: reservation._id },
      { $set: { totalprice: globalTotal } }
    );

    return res.status(201).json({
      status: true,
      message: 'Tạo đơn đặt món và tổng thanh toán thành công',
      totalPrice: globalTotal,
      createdOrders
    });

  } catch (error) {
    console.error('[DEBUG] Error in servantCreateTableOrderForCustomer:', error);
    res.status(500).json({ status: false, message: error.message });
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

/* Cập nhật đơn đặt món */
exports.servantUpdateTableOrder = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params

    const tableOrder = await TableOrder.findOne({ _id: orderId }).populate('reservationId')
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy TableOrder' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền sửa đơn này' });
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
      status: true,
      message: 'Cập nhật đơn đặt món thành công',
      updatedOrder
    });

  } catch (error) {
    console.error('[DEBUG] Error in servantUpdateTableOrder:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Gửi đơn đặt món cho Chef */
exports.servantSendTableOrderToChef = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy TableOrder' });
    }

    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền gửi đơn này' });
    }

    tableOrder.status = 'preparing'; //Gui toi cho chef
    await tableOrder.save();

    return res.json({
      status: true,
      message: 'Gửi đơn đặt món cho Chef thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in servantSendTableOrderToChef:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Servant xoa don dat mon */
exports.servantDeleteTableOrder = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { orderId } = req.params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy TableOrder' });
    }

    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền xóa đơn này' });
    }

    await TableOrder.findByIdAndDelete(orderId);
    return res.status(204).json({ status: true, message: 'Xóa đơn đặt món thành công', tableOrder });

  } catch (error) {
    console.error('[DEBUG] Error in servantDeleteTableOrder:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Cập nhật trạng thái từng món ăn */
exports.updateFoodItemStatusInTableOrder = async (req, res) => {
  try {
    const { orderId, foodId } = req.params;
    const { status } = req.body; // status: 'pending', 'preparing', 'ready_to_serve', 'served'
    const servantId = req.jwtDecode.id;
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }

    const tableOrder = await TableOrder.findById(orderId);
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy đơn đặt món' });
    }

    const foodItem = tableOrder.foods.find(f => f.foodId.toString() === foodId);
    if (!foodItem) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy món ăn trong đơn đặt món này' });
    }

    // Cập nhật trạng thái món ăn
    foodItem.status = status;
    await tableOrder.save();

    return res.json({
      status: true,
      message: 'Cập nhật trạng thái món ăn thành công',
      tableOrder
    });

  } catch (error) {
    console.error('[DEBUG] Error in updateFoodItemStatusInTableOrder:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Xóa một món ra khỏi tableOrder */
exports.deleteFoodItemFromTableOrder = async (req, res) => {
  try {
    const { orderId, foodId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }
    const servantId = req.jwtDecode.id;
    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy đơn đặt món' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền xóa món này' });
    }
    // Tìm món ăn trong foods
    const foodIndex = tableOrder.foods.findIndex(f => f.foodId.toString() === foodId);
    if (foodIndex === -1) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy món ăn trong đơn đặt món này' });
    }
    // Xóa món ăn
    tableOrder.foods.splice(foodIndex, 1);
    // Cập nhật lại totalprice
    tableOrder.totalprice = tableOrder.foods.reduce((total, f) => total + (f.quantity || 1) * (f.foodId?.price || 0), 0);
    await tableOrder.save();
    return res.json({
      status: true,
      message: 'Xóa món ăn khỏi đơn đặt món thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in deleteFoodItemFromTableOrder:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Servant chuyển bàn cho khách */
exports.servantTransferTableOrderToCustomer = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id;
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ status: false, message: 'ID không hợp lệ' });
    }
    const tableOrder = await TableOrder.findById(orderId).populate('reservationId');
    if (!tableOrder) {
      return res.status(404).json({ status: false, message: 'Không tìm thấy đơn đặt món' });
    }
    if (tableOrder.reservationId.servantId.toString() !== servantId) {
      return res.status(403).json({ status: false, message: 'Bạn không có quyền chuyển đơn này' });
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
      status: true,
      message: 'Chuyển đơn đặt món cho khách thành công',
      tableOrder
    });
  } catch (error) {
    console.error('[DEBUG] Error in servantTransferTableOrderToCustomer:', error);
    res.status(500).json({ status: false, message: error.message });
  }
};

/* Hoàn tất thanh toán */


/* Thống kê đặt món của servant */
exports.getTableOrderStats = async (req, res) => {
  try {
    const { type, from, to } = req.query; // type: day|week|month|year, from/to: ISO date string
    const servantId = req.jwtDecode.id;
    // Xác định khoảng thời gian lọc
    let match = {};
    if (from && to) {
      match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    match.servantId = new mongoose.Types.ObjectId(servantId);
    // Group theo type
    let groupId = null;
    switch (type) {
      case 'day':
        groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        break;
      case 'week':
        groupId = { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
        break;
      case 'month':
        groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
        break;
      case 'year':
        groupId = { year: { $year: "$createdAt" } };
        break;
      default:
        return res.status(400).json({ status: false, message: 'type phải là day|week|month|year' });
    }

    const stats = await TableOrder.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalprice" },
          orders: { $push: "$_id" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    res.json({ status: true, stats });
  } catch (err) {
    console.error('[DEBUG] Error in getTableOrderStats:', err);
    res.status(500).json({ status: false, message: err.message });
  }
};
