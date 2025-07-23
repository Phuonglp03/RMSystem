const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');
const mongoose = require('mongoose');

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
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bàn' });
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
