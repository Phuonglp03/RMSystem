const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware')
const {
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/notificationController')

/* https://rm-system-4tru.vercel.app/api/notification/ */
router.get('/', authMiddleware, getNotifications)
/* https://rm-system-4tru.vercel.app/api/notification/read */
router.patch('/read/:notificationId', authMiddleware, markNotificationAsRead)
/* https://rm-system-4tru.vercel.app/api/notification/delete */
router.delete('/delete/:notificationId', authMiddleware, deleteNotification)
module.exports = router