const User = require('../models/User')
const Notification = require('../models/Notification')
const mongoose = require('mongoose')

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
        }
        const page = parseInt(req.query.page) || 1 // Trang hiện tại, mặc định là 1
        const limit = parseInt(req.query.limit) || 10 // Số lượng thông báo mỗi trang, mặc định là 10
        const skip = (page - 1) * limit // Số lượng thông báo cần bỏ qua

        const user = await User.findById(userId).select('notifications')
        const notificationIds = user.notifications

        const notifications = await Notification.find({ _id: { $in: notificationIds } })
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
            .skip(skip) // Bỏ qua các thông báo đã hiển thị
            .limit(limit) // Giới hạn số lượng thông báo trả về

        const formattedNotifications = notifications.map(n => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            createdAt: n.createdAt
        }))

        res.status(200).json({
            success: true,
            notifications: formattedNotifications,
            total: notifications.length,
            page: page,
            limit: limit
        });
    } catch (err) {
        console.error(`Lỗi khi lấy thông báo: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({ success: false, message: 'ID thông báo không hợp lệ' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, relatedEntityId: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Thông báo không tồn tại hoặc bạn không có quyền truy cập' });
        }

        res.status(200).json({ success: true, message: 'Đánh dấu thông báo là đã đọc thành công', notification });
    } catch (err) {
        console.error(`Lỗi khi đánh dấu thông báo là đã đọc: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({ success: false, message: 'ID thông báo không hợp lệ' });
        }

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            relatedEntityId: userId
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Thông báo không tồn tại hoặc bạn không có quyền truy cập' });
        }

        // Cập nhật mảng notifications của người dùng
        await User.findByIdAndUpdate(userId, { $pull: { notifications: notificationId } });

        res.status(200).json({ success: true, message: 'Xóa thông báo thành công' });
    } catch (err) {
        console.error(`Lỗi khi xóa thông báo: ${err.message}`);
        res.status(500).json({ success: false, message: `Lỗi máy chủ: ${err.message}` });
    }
}