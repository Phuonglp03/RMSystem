const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware')
const {
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/notificationController')

/* http://localhost:9999/api/notification/ */
router.get('/', authMiddleware, getNotifications)
/* http://localhost:9999/api/notification/read */
router.patch('/read/:notificationId', authMiddleware, markNotificationAsRead)
/* http://localhost:9999/api/notification/delete */
router.delete('/delete/:notificationId', authMiddleware, deleteNotification)
module.exports = router