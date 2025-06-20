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
    }
}

export default notificationService;