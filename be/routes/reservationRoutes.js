const express = require('express');
const router = express.Router();
const {
    getUnAssignedReservations,
    getCustomerReservationByServantId,
    confirmOrRejectReservation,
    updateReservationStatus,
    confirmCustomerArrival,
    getDailyReservationStatistics,
    servantCreateReservation
} = require('../controllers/reservationController');

const { authMiddleware } = require('../middleware/authMiddleware');
/* /api/reservations/unassigned */
router.get('/unassigned', authMiddleware, getUnAssignedReservations);
/* /api/reservations/customer */
router.get('/customer', authMiddleware, getCustomerReservationByServantId);
/* /api/reservations/confirm-reject */
router.post('/confirm-reject', authMiddleware, confirmOrRejectReservation);
/* /api/reservations/update-status */
router.post('/update-status', authMiddleware, updateReservationStatus);
/* /api/reservations/confirm-arrival */
router.post('/confirm-arrival', authMiddleware, confirmCustomerArrival);
/* /api/reservations/daily-statistics */
router.get('/daily-statistics', authMiddleware, getDailyReservationStatistics);
/* /api/reservations/servant/create */
router.post('/servant/create', authMiddleware, servantCreateReservation);


module.exports = router;