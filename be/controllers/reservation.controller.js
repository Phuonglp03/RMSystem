const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');
const Servant = require('../models/Servant');
const Customer = require('../models/Customer');
const crypto = require('crypto');
const { emailService } = require('../services/EmailService');

/* Customer reservation */
const getAvailableTables = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ngày và giờ' });
    }

    const startTime = new Date(date);
    const [hours, minutes] = time.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2); // End time is 2 hours after start time

    // Thời gian sớm nhất có thể đặt trước bàn (2 giờ trước thời gian bắt đầu)
    const earliestTimeForBooking = new Date(startTime);
    earliestTimeForBooking.setHours(startTime.getHours() - 2);

    // Thời gian muộn nhất có thể đặt trước bàn (30 phút trước thời gian bắt đầu)
    const latestTimeForBooking = new Date(startTime);
    latestTimeForBooking.setMinutes(startTime.getMinutes() - 30);

    // Tìm tất cả các đặt bàn không bị hủy và có thời gian chồng chéo
    const existingReservations = await Reservation.find({
      $and: [
        { status: { $ne: 'cancelled' } },
        {
          $or: [
            // Các bàn đã đặt có thời gian bắt đầu nằm trong khoảng thời gian đặt (startTime đến endTime)
            { startTime: { $lt: endTime, $gte: startTime } },

            // Các bàn đã đặt có thời gian kết thúc nằm trong khoảng thời gian đặt 
            { endTime: { $gt: startTime, $lte: endTime } },

            // Các bàn đã đặt bao trùm toàn bộ thời gian đặt (startTime đến endTime)
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } },

            // Các bàn đã đặt bắt đầu trong khoảng 2 giờ trước và 30 phút trước thời gian bắt đầu đặt mới
            {
              startTime: {
                $gte: earliestTimeForBooking,
                $lte: latestTimeForBooking
              }
            },

            // Các bàn đã đặt kết thúc sau thời gian bắt đầu đặt mới và trong vòng 2 giờ sau đó
            {
              endTime: {
                $gt: startTime,
                $lt: new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
              }
            }
          ]
        }
      ]
    }).populate('bookedTable');

    // Lấy danh sách ID các bàn đã được đặt
    const bookedTableIds = existingReservations.flatMap(reservation =>
      reservation.bookedTable.map(table => table._id.toString())
    );

    // Lấy tất cả các bàn
    const allTables = await Table.find();

    // Đánh dấu các bàn có sẵn hoặc đã đặt
    const availableTables = allTables.map(table => ({
      id: table._id.toString(),
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: bookedTableIds.includes(table._id.toString()) ? 1 : 0,
      position: {
        row: Math.ceil(table.tableNumber / 5),
        col: table.tableNumber % 5 === 0 ? 5 : table.tableNumber % 5
      }
    }));

    return res.status(200).json({ success: true, data: availableTables });
  } catch (error) {
    console.error('Error getting available tables:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách bàn trống', error: error.message });
  }
};

// Tạo đặt bàn mới
const createReservation = async (req, res) => {
  try {
    const { tables, date, time, name, phone, email, note, guests } = req.body;

    if (!tables || !tables.length || !date || !time || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin đặt bàn'
      });
    }

    const startTime = new Date(date);
    const [hours, minutes] = time.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2);

    const existingReservations = await Reservation.find({
      bookedTable: { $in: tables },
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (existingReservations.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Một hoặc nhiều bàn đã được đặt trong thời gian này hoặc quá gần với đặt bàn hiện có'
      });
    }

    // Lấy thông tin số bàn để gửi email
    const tableDetails = await Table.find({ _id: { $in: tables } });
    const tableNumbers = tableDetails.map(table => table.tableNumber).join(', ');

    let user = await User.findOne({ email: email });
    let tempPassword = '';
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      tempPassword = Math.random().toString(36).slice(-8);

      // Create new user
      user = new User({
        fullname: name,
        username: email.split('@')[0], // Using email prefix as username
        email: email,
        phone: phone,
        password: tempPassword,
        role: 'customer'
      });

      await user.save();

      // Create customer profile
      const customer = new Customer({
        userId: user._id
      });

      await customer.save();
    }

    const reservationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newReservation = new Reservation({
      reservationCode: reservationCode,
      bookedTable: tables,
      customerId: user._id,
      startTime,
      endTime,
      note: note || '',
      status: 'confirmed',
      numberOfPeople: guests
    });

    await newReservation.save();

    // Gửi email xác nhận đặt bàn
    if (email) {
      // Gửi email chào mừng và thông tin tài khoản nếu là người dùng mới
      if (isNewUser) {
        const welcomeEmailData = emailService.createWelcomeEmail(name, email, tempPassword);
        await emailService.sendEmail(email, welcomeEmailData.subject, welcomeEmailData.html, welcomeEmailData.text);
      }

      // Gửi email xác nhận đặt bàn
      const confirmationEmailData = emailService.createReservationConfirmation(
        name,
        reservationCode,
        date,
        time,
        tableNumbers,
        guests
      );
      await emailService.sendEmail(email, confirmationEmailData.subject, confirmationEmailData.html, confirmationEmailData.text);
    }

    return res.status(201).json({
      success: true,
      message: 'Đặt bàn thành công',
      data: {
        reservationCode: newReservation.reservationCode,
        startTime: newReservation.startTime,
        endTime: newReservation.endTime,
        status: newReservation.status
      }
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo đặt bàn',
      error: error.message
    });
  }
};

// Lấy thông tin đặt bàn
const getReservation = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã đặt bàn'
      });
    }

    const reservation = await Reservation.findOne({ reservationCode: code })
      .populate('bookedTable')
      .populate('customerId', 'fullname phone email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin đặt bàn'
      });
    }

    return res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error getting reservation:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin đặt bàn',
      error: error.message
    });
  }
};

// Lấy danh sách đặt bàn theo ngày
const getReservationsFromToday = async (req, res) => {
  try {
    const { date } = req.query;
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);

    const reservations = await Reservation.find({
      startTime: { $gte: startTime }
    })
      .populate('bookedTable')
      .populate('customerId', 'fullname phone email')
      .sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error getting reservations from today:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách đặt bàn',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableTables,
  createReservation,
  getReservation,
  getReservationsFromToday
};
