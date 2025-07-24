const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt');
const { emailService } = require('../services/EmailService');

// Lấy tất cả reservation (có filter status, search)
exports.getAllReservations = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { reservationCode: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { 'customerId.fullname': { $regex: search, $options: 'i' } },
        { 'customerId.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    const reservations = await Reservation.find(query)
      .populate('bookedTable', 'tableNumber capacity')
      .populate({
        path: 'customerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'fullname phone email'
        }
      })
      .sort({ startTime: 1 });
    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết reservation
exports.getReservationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id)
      .populate('bookedTable', 'tableNumber capacity')
      .populate('customerId', 'fullname phone email');
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn' });
    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái reservation (hủy, hoàn thành, xác nhận khách đến)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    const reservation = await Reservation.findById(id)
      .populate('bookedTable', 'tableNumber capacity')
      .populate({
        path: 'customerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'fullname phone email username'
        }
      });
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn' });

    const prevStatus = reservation.status;
    if (status === 'served') {
      // Xác nhận khách đến: cập nhật startTime = now, endTime = now + 2h
      const now = new Date();
      reservation.startTime = now;
      reservation.endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      reservation.status = 'served';
      // Thêm reservationId vào currentReservation của các bàn
      await Table.updateMany(
        { _id: { $in: reservation.bookedTable } },
        { $addToSet: { currentReservation: reservation._id } }
      );
    } else {
      reservation.status = status;
    }
    await reservation.save();

    // Nếu chuyển sang confirmed thì gửi email xác nhận đặt bàn (có mã code)
    if (prevStatus !== 'confirmed' && status === 'confirmed') {
      // Lấy thông tin khách hàng
      let customer = Array.isArray(reservation.customerId) ? reservation.customerId[0] : reservation.customerId;
      let user = customer && customer.userId ? customer.userId : null;
      if (user && user.email) {
        // Lấy thông tin bàn
        const tableNumbers = Array.isArray(reservation.bookedTable)
          ? reservation.bookedTable.map(table => table.tableNumber).join(', ')
          : '';
        const confirmationEmailData = emailService.createReservationConfirmation(
          user.fullname || user.username || 'Quý khách',
          reservation.reservationCode,
          reservation.startTime,
          reservation.startTime ? reservation.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
          tableNumbers,
          reservation.numberOfPeople
        );
        await emailService.sendEmail(user.email, confirmationEmailData.subject, confirmationEmailData.html, confirmationEmailData.text);
      }
    }

    res.json({ success: true, message: 'Cập nhật trạng thái thành công', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật thông tin reservation (số người, note, ...)
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Đảm bảo bookedTable là mảng ObjectId
    if (updateData.bookedTable) {
      updateData.bookedTable = Array.isArray(updateData.bookedTable)
        ? updateData.bookedTable.map(tid => mongoose.Types.ObjectId(tid))
        : [mongoose.Types.ObjectId(updateData.bookedTable)];
    }
    // Kiểm tra trùng lịch bàn
    if (updateData.bookedTable && updateData.startTime) {
      const startTime = new Date(updateData.startTime);
      const endTime = updateData.endTime ? new Date(updateData.endTime) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
      // Tìm tất cả reservation trùng lịch
      const conflicts = await Reservation.find({
        _id: { $ne: id },
        bookedTable: { $in: updateData.bookedTable },
        status: { $in: ['pending', 'confirmed', 'served'] },
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      }).populate('bookedTable', 'tableNumber');
      if (conflicts.length > 0) {
        // Lấy ra các tableNumber bị trùng
        const conflictTables = [];
        conflicts.forEach(conflict => {
          conflict.bookedTable.forEach(tb => {
            if (updateData.bookedTable.map(String).includes(String(tb._id))) {
              conflictTables.push(tb.tableNumber);
            }
          });
        });
        return res.status(400).json({ success: false, message: `Các bàn bị trùng lịch: ${[...new Set(conflictTables)].join(', ')}` });
      }
    }
    const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('bookedTable', 'tableNumber capacity')
      .populate({
        path: 'customerId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'fullname phone email'
        }
      });
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn' });
    res.json({ success: true, message: 'Cập nhật thông tin thành công', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách bàn kèm trạng thái sử dụng dựa vào currentReservation
exports.getAllTablesWithStatus = async (req, res) => {
  try {
    const tables = await Table.find().populate('currentReservation')
    .sort({ tableNumber: 1 });
    const result = tables.map(table => ({
      _id: table._id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      isOccupied: Array.isArray(table.currentReservation) && table.currentReservation.length > 0,
      currentReservation: table.currentReservation,
    }));
    res.json({ success: true, tables: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo reservation nhanh cho bàn trống
exports.quickCreateReservation = async (req, res) => {
  try {
    const { bookedTable, numberOfPeople, note } = req.body;
    if (!bookedTable || !Array.isArray(bookedTable) || bookedTable.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bàn.' });
    }
    // Lấy userId từ token
    const userId = req.jwtDecode?.id;
    let servantId = undefined;
    if (userId) {
      const servant = await require('../models/Servant').findOne({ userId });
      if (!servant) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy servant tương ứng với user hiện tại.' });
      }
      servantId = servant._id;
    }
    // Tạo mã reservationCode ngẫu nhiên
    const reservationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Thời gian bắt đầu là hiện tại, kết thúc +2h
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    const newReservation = new Reservation({
      bookedTable,
      servantId,
      reservationCode,
      startTime,
      endTime,
      status: 'served',
      numberOfPeople: numberOfPeople || 1,
      note: note || '',
    });
    await newReservation.save();
    // Cập nhật currentReservation cho các bàn
    await Table.updateMany(
      { _id: { $in: bookedTable } },
      { $addToSet: { currentReservation: newReservation._id } }
    );
    res.json({ success: true, reservation: newReservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gán customerId vào reservation khi thanh toán (tạo user/customer nếu cần)
exports.attachCustomerToReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, fullname } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Cần cung cấp email hoặc số điện thoại.' });
    }
    let user = null;
    if (email) {
      user = await User.findOne({ email });
    }
    if (!user && phone) {
      user = await User.findOne({ phone });
    }
    let isNewUser = false;
    let tempPassword = '';
    if (!user) {
      isNewUser = true;
      tempPassword = Math.random().toString(36).slice(-8);
      const username = email ? email.split('@')[0] : (phone || (Date.now() + ''));
      user = new User({
        fullname: fullname || 'Khách lẻ',
        username: username.toLowerCase(),
        email: email || (username + '@noemail.com'),
        phone: phone || '',
        password: await bcrypt.hash(tempPassword, 12),
        role: 'customer',
      });
      await user.save();
    }
    // Tìm hoặc tạo customer
    let customer = await Customer.findOne({ userId: user._id });
    if (!customer) {
      customer = new Customer({ userId: user._id });
      await customer.save();
    }
    // Gán customerId vào reservation
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { customerId: [customer._id] },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy reservation.' });
    res.json({ success: true, reservation, isNewUser, tempPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
