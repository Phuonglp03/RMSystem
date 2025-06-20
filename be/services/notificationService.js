const notifications = require('../models/Notification');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const cron = require('node-cron');
const User = require('../models/User');

const notificationService = {
    async addNotification(userId, notificationData) {
        try {
            //Tạo Notification document mới
            const notification = await notifications.create(notificationData);
            //Gắn notification vao user
            await User.findByIdAndUpdate(
                userId,
                { $push: { notifications: notification._id } },
                { new: true, useFindAndModify: false }
            );
        } catch (err) {
            console.error(`Lỗi khi thêm thông báo: ${err.message}`);
            throw new Error('Failed to add notification');
        }
    },

    async createReservationNotification(reservation, type) {
        try {
            if (!NOTIFICATION_TYPES[type]) {
                throw new Error('Invalid notification type');
            }
            const messages = {
                [NOTIFICATION_TYPES.RESERVATION_CONFIRMED_BY_SERVANT]: {
                    title: 'Xác nhận đặt bàn thành công',
                    message: `Đơn đặt bàn của bạn đã được phục vụ xác nhận. Xin truy cập lịch sử đặt bàn hoặc click vào đây để nhận reservaton code`
                },
                [NOTIFICATION_TYPES.RESERVATION_REJECTED_BY_SERVANT]: {
                    title: 'Từ chối đơn đặt bàn',
                    message: `Đơn đặt bàn của bạn đã bị phục vụ từ chối. Bạn hãy tạo đơn đặt bàn khác.`
                },
            }

            const notification = messages[type];
            return {
                title: notification.title,
                message: notification.message,
                type: type,
                relatedId: data.reservationId
            };
        } catch (err) {
            console.error(`Lỗi khi tạo thông báo reservation: ${err.message}`);
            throw new Error('Failed to create reservation notification');
        }
    },

    //Chức năng xóa thông báo cũ
    async deleteOldNotifications() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            await User.updateMany(
                {},
                {
                    $pull: {
                        notifications: {
                            createdAt: { $lt: sevenDaysAgo }
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Error deleting old notifications:', error);
        }
    }
}

export default notificationService;