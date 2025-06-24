const Reservation = require('../models/Reservation')
const Table = require('../models/Table')
const User = require('../models/User')
const Servant = require('../models/Servant')
const Customer = require('../models/Customer')
const mongoose = require('mongoose')
const NOTIFICATION_TYPES = require('../constants/notificationTypes.js')
const notificationService = require('../services/notificationService.js')

//Lay tat ca danh sach dat ban cua khach hang phia servant
const getUnAssignedReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ servantId: null, status: 'pending' })
            .populate({
                path: 'bookedTable',
                select: 'tableNumber capacity status '
            })
            .populate({
                path: 'customerId',
                select: 'fullname email phone dateOfBirth gender'
            })
        console.log('reservations: ', reservations)
        const formattedReservations = reservations.map(reservation => ({
            _id: reservation._id,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            numberOfPeople: reservation.numberOfPeople,
            note: reservation.note,
            customer: reservation.customerId ? {
                fullname: reservation?.customerId.fullname,
                email: reservation?.customerId.email,
                phone: reservation?.customerId.phone,
                dateOfBirth: reservation?.customerId.dateOfBirth,
            } : null,
            table: [{
                tableNumber: reservation.bookedTable?.tableNumber,
                capacity: reservation.bookedTable?.capacity,
                status: reservation.bookedTable?.status,
            }]
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
        const servantId = req.jwtDecode.id; // Lấy ID của servant từ token

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

        console.log('reservation: ', reservations)
        const formattedReservations = await Promise.all(reservations.map(async (reservation) => {
            const customerDetail = reservation.customerId
                ? await Customer.findOne({ userId: reservation.customerId._id }).lean()
                : null;
            const servantDetail = await Servant.findOne({ userId: reservation.servantId._id }).lean();

            return {
                reservationId: reservation._id,
                status: reservation.status,
                bookingTime: reservation.bookingTime,
                note: reservation.note || null,
                numberOfPeople: reservation.numberOfPeople,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                table: (reservation.bookedTable || []).map(t => ({
                    tableNumber: t?.tableNumber,
                    capacity: t?.capacity,
                    status: t?.status,
                })),

                customer: customerDetail ? {
                    id: reservation.customerId._id,
                    name: reservation.customerId.fullname,
                    email: reservation.customerId.email,
                    phone: reservation.customerId.phone,
                    dateOfBirth: reservation.customerId.dateOfBirth,
                    gender: reservation.customerId.gender,
                } : null,

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
        const { reservationId } = req.params
        const { action } = req.body; // action: 'confirm' or 'reject'
        console.log('action: ', action)
        const servantId = req.jwtDecode.id
        console.log('servantId: ', servantId)
        const reservation = await Reservation.findById(reservationId);
        console.log('reservation: ', reservation)
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }

        // if (reservation.servantId.toString() !== servantId) {
        //     return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        // }

        if (action === 'confirm') {
            reservation.status = 'confirmed';
            reservation.servantId = servantId
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


//Xac nhan khach hang da den
const confirmCustomerArrival = async (req, res) => {
    try {
        const { reservationCode } = req.body;
        const servantId = req.jwtDecode.id;

        const reservation = await Reservation.findOne({ reservationCode })
            .populate({
                path: 'bookedTable',
                select: 'tableNumber capacity status'
            })
            .populate({
                path: 'customerId',
                select: 'fullname email phone avatar'
            });
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }

        if (reservation.servantId.toString() !== servantId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }

        reservation.status = 'completed';
        await reservation.save();

        const formattedReservations = {
            id: reservation._id,
            start: reservation.startTime,
            end: reservation.endTime,
            numberOfPeople: reservation.numberOfPeople,
            status: reservation.status,
            table: [{
                number: reservation.bookedTable.tableNumber,
                capacity: reservation.bookedTable.capacity,
                status: reservation.bookedTable.status
            }],
            customer: reservation.customerId ? {
                name: reservation.customerId.fullname,
                email: reservation.customerId.email,
                phone: reservation.customerId.phone,
                avatar: reservation.customerId.avatar
            } : null,
        }

        res.status(200).json({ success: true, message: 'Xác nhận khách hàng đã đến thành công', reservation: formattedReservations });
    } catch (err) {
        console.error(`Lỗi khi xác nhận khách hàng đã tới: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

//Xac nhan khach hang khong den
const confirmCustomerNotArrival = async (req, res) => {
    try {
        const { reservationCode } = req.body
        const servantId = req.jwtDecode.id

        const reservation = await Reservation.findOne({ reservationCode: reservationCode })
            .populate({
                path: 'bookedTable',
                select: 'tableNumber capacity status'
            })
            .populate({
                path: 'customerId',
                select: 'fullname email phone avatar'
            });

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }

        if (reservation.servantId.toString() !== servantId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }
        reservation.status = 'no-show';
        await reservation.save();

        const formattedReservations = reservation.map(resv => ({
            id: resv._id,
            start: resv.startTime,
            end: resv.endTime,
            numberOfPeople: resv.numberOfPeople,
            table: [{
                number: resv.bookedTable.tableNumber,
                capacity: resv.bookedTable.capacity,
                status: resv.bookedTable.status
            }],
            customer: {
                name: resv.customerId.fullname,
                email: resv.customerId.email,
                phone: resv.customerId.phone,
                avatar: resv.customerId.avatar
            }
        }))

        res.status(200).json({ success: true, message: 'Xác nhận khách hàng không đến thành công', reservation: formattedReservations });

    } catch (err) {
        console.error(`Lỗi khi xác nhận khách hàng không tới: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}


//Xem thong ke dat ban (theo ngay, theo thang, theo nam) cua moi servant
const getDailyReservationStatistics = async (req, res) => {
    try {
        const servantUserId = req.jwtDecode.id;
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

const MS_PER_HOUR = 60 * 60 * 1000;

const servantCreateReservation = async (req, res) => {
    try {

        const { bookedTableId, startTime, endTime, numberOfPeople, note } = req.body
        const servantId = req.jwtDecode.id

        const servant = await Servant.findOne({ userId: servantId })
        if (!servant) {
            return res.status(404).json({ success: false, message: 'Servant không tồn tại' });
        }

        //Kiem tra khoang thoi gian
        const start = new Date(startTime)
        const end = new Date(endTime)
        const diff = end.getTime() - start.getTime();

        if (diff < MS_PER_HOUR) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian đặt bàn tối thiểu 1 giờ.'
            });
        }

        if (diff > 3 * MS_PER_HOUR) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian đặt bàn tối đa 3 giờ.'
            });
        }

        const bookedTables = await Table.find({ _id: { $in: bookedTableId } })
        console.log('bookedTables: ', bookedTables)
        if (bookedTables.length !== bookedTableId.length) {
            return res.status(404).json({ success: false, message: 'Có bàn đặt không tồn tại' });
        }

        for (let table of bookedTables) {
            //Kiem tra lich turng tren ban do
            const conflictingReservation = await Reservation.findOne({
                bookedTable: table._id,
                status: { $in: ['pending', 'confirmed'] },
                //Kiem tra khoang thoi gian
                $and: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                ]
            });

            if (conflictingReservation) {
                return res.status(400).json({
                    success: false,
                    message: `Bàn ${table.tableNumber} đã được đặt trong khoảng thời gian từ ${startTime} đến ${endTime}`
                })
            }
        }

        const tableIds = bookedTableId.map(t => new mongoose.Types.ObjectId(t))

        const newReservation = new Reservation({
            bookedTable: tableIds,
            customerId: null,
            startTime,
            endTime,
            numberOfPeople,
            note,
            servantId,  //servant.userId._id, // Lưu ID của servant
            status: 'confirmed', // Trạng thái khi servant đặt là 'confirmed'
            bookingTime: new Date(), // Thời gian đặt bàn
            reservationCode: `RES${Date.now()}`
        });

        await newReservation.save();

        for (let table of bookedTables) {
            // Đánh dấu bàn là không còn sẵn có
            table.status = false;
            table.currentReservation = table.currentReservation || [];
            // Thêm đặt bàn vào danh sách hiện tại của bàn
            table.currentReservation.push(newReservation._id);
            await table.save();
            console.log('table.currentReservation: ', table.currentReservation)
        }



        const reservation = await Reservation.findById(newReservation._id)
            .populate({
                path: 'servantId',
                select: '_id fullname email phone',
            })

        const notificationData = await notificationService.createReservationNotification({
            reservationId: reservation._id,
            reservationCode: reservation.reservationCode
        }, NOTIFICATION_TYPES.RESERVATION_CREATED_BY_SERVANT)

        await notificationService.addNotification(
            reservation.servantId._id,
            notificationData
        );

        res.status(201).json({
            success: true,
            message: 'Đặt bàn thành công',
            reservation: {
                _id: newReservation._id,
                bookedTable: bookedTables?.map(t => `Bàn số ${t.tableNumber}`),
                startTime: newReservation.startTime,
                endTime: newReservation.endTime,
                numberOfPeople: newReservation.numberOfPeople,
                note: newReservation.note,
                status: newReservation.status,
                bookingTime: newReservation.bookingTime,
                servant: {
                    id: reservation?.servantId?._id,
                    name: reservation?.servantId?.fullname || 'N/A',
                    email: reservation?.servantId?.email,
                    phone: reservation?.servantId?.phone
                }
            },

        });

    } catch (err) {
        console.error(`Lỗi khi servant tạo reservation: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

//Cap nhat thong tin dat ban
const servantUpdateReservationInformation = async (req, res) => {
    try {
        const { reservationId } = req.params; // status: 'confirmed', 'cancelled', 'completed', 'no-show'
        const servantId = req.jwtDecode.id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đặt bàn không tồn tại' });
        }
        // if (reservation.servantId.toString() !== servantId) {
        //     return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        // }

        const { startTime, endTime, numberOfPeople, note, status } = req.body
        const validStatused = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show']
        if (status && !validStatused.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }
        if (startTime) reservation.startTime = startTime;
        if (endTime) reservation.endTime = endTime;
        if (numberOfPeople) reservation.numberOfPeople = numberOfPeople;
        if (note) reservation.note = note;
        if (status) reservation.status = status;

        await reservation.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đặt bàn thành công',
            reservation: reservation
        });
    } catch (err) {
        console.error(`updateReservationStatus error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

const getReservationDetailById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const servantId = req.jwtDecode.id;

        const reservation = await Reservation.findOne({ _id: reservationId })
            .populate('bookedTable', 'tableNumber capacity status')
            .populate({
                path: 'customerId',
                select: '_id fullname email phone dateOfBirth gender'
            })
            .populate({
                path: 'servantId',
                select: '_id fullname email phone dateOfBirth gender'
            });

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Đơn đặt bàn không tồn tại hoặc bạn không có quyền xem' });
        }

        console.log('customerId: ', reservation.customerId)

        res.status(200).json({
            success: true,
            message: 'Chi tiết đặt bàn',
            reservation: {
                reservationId: reservation._id,
                status: reservation.status,
                bookingTime: reservation.bookingTime,
                note: reservation.note || null,
                numberOfPeople: reservation.numberOfPeople,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                reservationCode: reservation.reservationCode,
                table: (reservation.bookedTable || []).map(t => ({
                    tableNumber: t?.tableNumber,
                    capacity: t?.capacity,
                    status: t?.status,
                })),
                customer: Array.isArray(reservation.customerId)
                    ? reservation.customerId.map((c) => ({
                        id: c._id,
                        name: c.fullname,
                        email: c.email,
                        phone: c.phone,
                        dateOfBirth: c.dateOfBirth,
                        gender: c.gender,
                    }))
                    : reservation.customerId
                        ? {
                            id: reservation.customerId._id,
                            name: reservation.customerId.fullname,
                            email: reservation.customerId.email,
                            phone: reservation.customerId.phone,
                            dateOfBirth: reservation.customerId.dateOfBirth,
                            gender: reservation.customerId.gender,
                        }
                        : null,
                servant: reservation.servantId ? {
                    id: reservation.servantId._id,
                    name: reservation.servantId.fullname,
                    phone: reservation.servantId.phone,
                } : null
            }
        });
    } catch (err) {
        console.error(`getReservationDetailById error: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
};


const servantDeleteReservation = async (req, res) => {
    try {

        const { reservationId } = req.params

        const servantId = req.jwtDecode.id

        const reservation = await Reservation.findOne({
            _id: reservationId,
            servantId: servantId
        }).populate({
            path: 'servantId',
            select: 'fullname email phone',
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation không tồn tại hoặc bạn không có quyền xóa'
            })
        }

        //Tìm cacsc bàn trong reservation
        const bookedTables = await Table.find({ _id: { $in: reservation.bookedTable } })
        for (let table of bookedTables) {
            table.status = true; //Đặt lại trạng thái bạn là true
            if (Array.isArray(table.currentReservation)) {
                table.currentReservation = table.currentReservation.filter(
                    (resId) => resId._id.toString() !== reservation._id.toString()
                )
            }

            await table.save()

        }

        await Reservation.findByIdAndDelete(reservation._id)

        const notificationData = await notificationService.createReservationNotification({
            reservationId: reservation._id,
            reservationCode: reservation.reservationCode,
            servant: reservation?.servantId?.fullname
        }, NOTIFICATION_TYPES.RESERVATION_DELETED_BY_SERVANT)

        await notificationService.addNotification(
            reservation.servantId._id,
            notificationData
        );

        res.json({
            success: true,
            message: 'Xóa reservation thành công',
            servant: {
                id: reservation?.servantId?._id,
                name: reservation?.servantId?.fullname || 'N/A',
                email: reservation?.servantId?.email,
                phone: reservation?.servantId?.phone
            }
        })

    } catch (err) {
        console.error(`Lỗi khi servant xóa reservation: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

const cleanUpCurrentReservations = async () => {
    try {
        const tables = await Table.find();
        for (let table of tables) {
            if (!Array.isArray(table.currentReservation) || table.currentReservation.length === 0) {
                continue;
            }

            // Kiểm tra id nào còn tồn tại trong Reservation
            const existingReservations = await Reservation.find({
                _id: { $in: table.currentReservation },
            }).select('_id');

            const existingIds = existingReservations.map((r) => r._id.toString());

            // Lọc ra chỉ còn lại ids tồn tại
            table.currentReservation = table.currentReservation.filter((resId) =>
                existingIds.includes(resId.toString())
            );

            await table.save();
        }

        console.log('✅ Đã dọn dẹp currentReservation thành công!');
    } catch (error) {
        console.error('❌ Lỗi khi dọn dẹp currentReservation:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

module.exports = {
    getUnAssignedReservations,
    getCustomerReservationByServantId,
    getDailyReservationStatistics,
    confirmCustomerArrival,
    servantUpdateReservationInformation,
    confirmOrRejectReservation,
    servantCreateReservation,
    confirmCustomerNotArrival,
    servantDeleteReservation,
    cleanUpCurrentReservations,
    getReservationDetailById
}
