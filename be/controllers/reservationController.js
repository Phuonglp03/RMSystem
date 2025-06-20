const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const User = require('../models/User');
const Servant = require('../models/Servant');
const Customer = require('../models/Customer');

//Lay tat ca danh sach dat ban cua khach hang phia servant
 const getUnAssignedReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ servantId: null })
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

        reservation.status = 'completed'; // Hoặc trạng thái phù hợp với xác nhận khách hàng đã đến
        await reservation.save();

        res.status(200).json({ success: true, message: 'Xác nhận khách hàng đã đến thành công', reservation });
    } catch (err) {
        console.error(`confirmCustomerArrival error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}


//Xem thong ke dat ban (theo ngay, theo thang, theo nam) cua moi servant
 const getReservationStatistics = async (req, res) => {
    try {

    } catch (err) {
        console.error(`getReservationStatistics error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}