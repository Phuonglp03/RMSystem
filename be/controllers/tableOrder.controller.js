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

/* Servant quản lý table order */
/* Nhận đơn đặt món từ customer, theo đơn đặt bàn do servant quản lý */
exports.getTableOrderFromCustomerByReservationCode = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { reservationCode } = req.body
    const reservation = Reservation.findOne({ reservationCode })

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đặt bàn với mã ${reservationCode}`
      })
    }

    const tableOrder = TableOrder.find({ reservationId: reservation._id })
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
      status: success,
      message: `Lấy danh sách đặt món theo ${reservationCode} thành công`,
      tableOrder
    })


  } catch (error) {
    console.error('[DEBUG] Error in getTableOrderFromCustomerByReservationCode:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

/* Tạo đơn đặt món cho customer */
exports.servantCreateTableOrderForCustomer = async (req, res) => {
  try {
    const servantId = req.jwtDecode.id
    const { reservationCode, orders } = req.body
    // orders: [{ tableId, foods, combos, status }]
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

    const createdOrders = await TableOrder.insertMany(
      orders.map(order => ({
        ...order,
        reservationId: reservation._id,
        status: 'preparing'
      }))
    );
    return res.status(201).json({
      status: true,
      message: 'Tạo đơn đặt món thành công',
      createdOrders
    });
  } catch (error) {
    console.error('[DEBUG] Error in servantCreateTableOrderForCustomer:', error);
    res.status(500).json({ status: false, message: error.message });
  }
}

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
