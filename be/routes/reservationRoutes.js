const express = require('express')
const router = express.Router()
const {
    getUnAssignedReservations,
    getCustomerReservationByServantId,
    confirmOrRejectReservation,
    updateReservationStatus,
    confirmCustomerArrival,
    getDailyReservationStatistics,
    servantCreateReservation,
    confirmCustomerNotArrival,
    servantDeleteReservation,
    cleanUpCurrentReservations
} = require('../controllers/reservationController')

const { authMiddleware } = require('../middleware/authMiddleware')
/* http://localhost:9999/api/reservations/servant/unassigned */
router.get('/servant/unassigned', authMiddleware, getUnAssignedReservations)
/* http://localhost:9999/api/reservations/servant/customer */
router.get('/servant/customer', authMiddleware, getCustomerReservationByServantId)
/* http://localhost:9999/api/reservations/servant/confirm-reject */
router.post('/servant/confirm-reject', authMiddleware, confirmOrRejectReservation)
/* http://localhost:9999/api/reservations/servant/update-status */
router.post('/servant/update-status', authMiddleware, updateReservationStatus)
/* http://localhost:9999/api/reservations/servant/confirm-arrival */
router.post('/servant/confirm-arrival', authMiddleware, confirmCustomerArrival)
/* http://localhost:9999/api/reservations/servant/daily-statistics */
router.get('/servant/daily-statistics', authMiddleware, getDailyReservationStatistics)
/* http://localhost:9999/api/reservations/servant/create */
router.post('/servant/create', servantCreateReservation)
/* http://localhost:9999/api/reservations//servant/confirm-not-arrive */
router.post('/servant/confirm-not-arrive', authMiddleware, confirmCustomerNotArrival)
/* http://localhost:9999/api/reservations/servant/delete/:reservationId */
router.delete('/servant/delete/:reservationId', servantDeleteReservation)
/* http://localhost:9999/api/reservations/servant/clear */
router.delete('/servant/clear', cleanUpCurrentReservations)


module.exports = router;