const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');
const Servant = require('../models/Servant');
const Customer = require('../models/Customer');

//Lay tat ca danh sach dat ban cua khach hang phia servant
const getUnAssignedReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ servantId: null, status: 'pending' })
            .populate('bookedTable', 'tableNumber capacity status ')
            .populate({
                path: 'customerId',
                select: 'fullname email phone dateOfBirth gender'
            })

        const formattedReservations = reservations.map(reservation => ({
            _id: reservation._id,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            numberOfPeople: reservation.numberOfPeople,
            note: reservation.note,
            customer: {
                fullname: reservation.customerId.fullname,
                email: reservation.customerId.email,
                phone: reservation.customerId.phone,
                dateOfBirth: reservation.customerId.dateOfBirth,
            }
        }))

        res.status(200).json({
            success: true,
            message: 'Danh sách đặt bàn chưa được phân công',
            reservations: formattedReservations
        });

    } catch (err) {
        console.error(`getAllCustomerReservations error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

//Lay danh sach dat ban cua khach hang phia servant
const getCustomerReservationByServantId = async (req, res) => {
    try {
        const servantId = req.user.id; // Lấy ID của servant từ token
        const servant = await Servant.findOne({ userId: servantId });
        if (!servant) {
            return res.status(404).json({ success: false, message: 'Servant không tồn tại' })
        }

        const reservations = await Reservation.find({ servantId: servantId })
            .populate('bookedTable', 'tableNumber capacity status')
            .populate({
                path: 'customerId',
                select: '_id fullname email phone dateOfBirth gender'
            })
            .populate({
                path: 'servantId',
                select: '_id fullname email phone dateOfBirth gender'
            })

        const formattedReservations = await Promise.all(reservations.map(async (reservation) => {
            const customerDetail = await Customer.findOne({ userId: reservation.customerId._id }).lean();
            const servantDetail = await Servant.findOne({ userId: reservation.servantId._id }).lean();

            return {
                reservationId: reservation._id,
                status: reservation.status,
                bookingTime: reservation.bookingTime,
                note: reservation.note || null,

                table: {
                    tableNumber: reservation.bookedTable?.tableNumber,
                    capacity: reservation.bookedTable?.capacity,
                    status: reservation.bookedTable?.status,
                },

                customer: {
                    id: reservation.customerId._id,
                    name: reservation.customerId.fullname,
                    email: reservation.customerId.email,
                    phone: reservation.customerId.phone,
                    dateOfBirth: reservation.customerId.dateOfBirth,
                    gender: reservation.customerId.gender,
                },

                servant: {
                    id: reservation.servantId._id,
                    name: reservation.servantId.fullname,
                    phone: reservation.servantId.phone,
                }
            };
        }));
        res.status(200).json({
            success: true,
            message: `Danh sách đặt bàn của khách hàng được phục vụ bởi bạn`,
            reservations: formattedReservations
        });

    } catch (err) {
        console.error(`getCustomerReservationByServantId error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

//Xac nhan/Tu choi yeu cau dat ban
const confirmOrRejectReservation = async (req, res) => {
    try {
        const { reservationId, action } = req.body; // action: 'confirm' or 'reject'
        const servantId = req.user.id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }

        if (reservation.servantId.toString() !== servantId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }

        if (action === 'confirm') {
            reservation.status = 'confirmed';
        } else if (action === 'reject') {
            reservation.status = 'cancelled';
        } else {
            return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
        }

        await reservation.save();
        res.status(200).json({ success: true, message: 'Cập nhật trạng thái đặt bàn thành công', reservation });
    } catch (err) {
        console.error(`confirmOrRejectReservation error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}


//Cap nhat thong tin dat ban
const updateReservationStatus = async (req, res) => {
    try {
        const { reservationId, status } = req.body; // status: 'confirmed', 'cancelled', 'completed', 'no-show'
        const servantId = req.user.id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }
        if (reservation.servantId.toString() !== servantId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }
        if (!['confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }
        reservation.status = status;
        await reservation.save();

        res.status(200).json({ success: true, message: 'Cập nhật trạng thái đặt bàn thành công', reservation });
    } catch (err) {
        console.error(`updateReservationStatus error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

//Xac nhan khach hang da den
const confirmCustomerArrival = async (req, res) => {
    try {
        const { reservationId } = req.body;
        const servantId = req.user.id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }

        if (reservation.servantId.toString() !== servantId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }

        reservation.status = 'completed';
        await reservation.save();

        res.status(200).json({ success: true, message: 'Xác nhận khách hàng đã đến thành công', reservation });
    } catch (err) {
        console.error(`confirmCustomerArrival error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}


//Xem thong ke dat ban (theo ngay, theo thang, theo nam) cua moi servant
const getDailyReservationStatistics = async (req, res) => {
    try {
        const servantUserId = req.user.id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết' });
        }

        const servant = await Servant.findOne({ userId: servantUserId });
        if (!servant) {
            return res.status(404).json({ success: false, message: 'Servant không tồn tại' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const reservations = await Reservation.find({
            servantId: servantUserId,
            bookingTime: { $gte: start, $lte: end }
        });

        const totalReservations = reservations.length;
        const confirmed = reservations.filter(r => r.status === 'confirmed').length;
        const cancelled = reservations.filter(r => r.status === 'cancelled').length;
        const completed = reservations.filter(r => r.status === 'completed').length;
        const noShow = reservations.filter(r => r.status === 'no-show').length;

        res.status(200).json({
            success: true,
            message: 'Thống kê đặt bàn thành công',
            statistics: {
                totalReservations,
                confirmed,
                cancelled,
                completed,
                noShow
            }
        });
    } catch (err) {
        console.error(`getDailyReservationStatistics error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
};

const servantCreateReservation = async (req, res) => {
    try {
        const { bookedTableId, startTime, endTime, numberOfPeople, note } = req.body
        const servantId = req.user.id

        const servant = await Servant.findOne({ userId: servantId })
        if (!servant) {
            return res.status(404).json({ success: false, message: 'Servant không tồn tại' });
        }
        const bookedTable = await Table.findById(bookedTableId)
        if (!bookedTable) {
            return res.status(404).json({ success: false, message: 'Bàn đặt không tồn tại' });
        }

        if (bookedTable.status !== true) {
            return res.status(400).json({ success: false, message: 'Bàn đã được đặt hoặc không còn sẵn có' });
        }

        const newReservation = new Reservation({
            bookedTable: bookedTableId,
            startTime,
            endTime,
            numberOfPeople,
            note,
            servantId: servant.userId._id, // Lưu ID của servant
            status: 'pending', // Trạng thái ban đầu là 'pending'
            bookingTime: new Date() // Thời gian đặt bàn
        });

        await newReservation.save();
        bookedTable.status = false; // Đánh dấu bàn là không còn sẵn có
        bookedTable.currentReservation.push(newReservation._id); // Thêm đặt bàn vào danh sách hiện tại của bàn
        await bookedTable.save();
        res.status(201).json({
            success: true,
            message: 'Đặt bàn thành công',
            reservation: {
                _id: newReservation._id,
                bookedTable: bookedTable.tableNumber,
                startTime: newReservation.startTime,
                endTime: newReservation.endTime,
                numberOfPeople: newReservation.numberOfPeople,
                note: newReservation.note,
                status: newReservation.status,
                bookingTime: newReservation.bookingTime,
                servant: servant.userId.fullname
            },

        });

    } catch (err) {
        console.error(`Lỗi khi servant tạo reservation: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

module.exports = {
    getUnAssignedReservations,
    getCustomerReservationByServantId,
    getDailyReservationStatistics,
    confirmCustomerArrival,
    updateReservationStatus,
    confirmOrRejectReservation,
    servantCreateReservation
}
