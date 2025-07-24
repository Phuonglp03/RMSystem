const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware')
const {
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/notificationController')

router.use(authMiddleware);
router.get('/', getNotifications)
router.patch('/read/:notificationId', markNotificationAsRead)
router.delete('/delete/:notificationId', deleteNotification)
module.exports = router