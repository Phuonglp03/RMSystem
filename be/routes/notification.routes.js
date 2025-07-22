const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware')
const {
    getNotifications,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/notificationController')

router.use(authMiddleware);
/* https://rm-system-4tru.vercel.app/api/notification/ */
router.get('/', getNotifications)
/* https://rm-system-4tru.vercel.app/api/notification/read */
router.patch('/read/:notificationId', markNotificationAsRead)
/* https://rm-system-4tru.vercel.app/api/notification/delete */
router.delete('/delete/:notificationId', deleteNotification)
module.exports = router