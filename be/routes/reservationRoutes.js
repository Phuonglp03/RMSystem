const express = require('express')
const router = express.Router()
const {
    getUnAssignedReservations,
    getCustomerReservationByServantId,
    confirmOrRejectReservation,
    servantUpdateReservationInformation,
    confirmCustomerArrival,
    getDailyReservationStatistics,
    servantCreateReservation,
    confirmCustomerNotArrival,
    servantDeleteReservation,
    cleanUpCurrentReservations,
    getReservationDetailById
} = require('../controllers/reservationController')

const { authMiddleware } = require('../middleware/authMiddleware')
/* http://localhost:9999/api/reservations/servant/unassigned */
router.get('/unassigned', getUnAssignedReservations)
/* http://localhost:9999/api/reservations/servant/customer */
router.get('/customer', authMiddleware, getCustomerReservationByServantId)
/* http://localhost:9999/api/reservations/servant/confirm-reject/:reservationId */
router.post('/confirm-reject/:reservationId', authMiddleware, confirmOrRejectReservation)
/* http://localhost:9999/api/reservations/servant/update */
router.put('/update/:reservationId', authMiddleware, servantUpdateReservationInformation)
/* http://localhost:9999/api/reservations/servant/confirm-arrival */
router.post('/confirm-arrival', authMiddleware, confirmCustomerArrival)
/* http://localhost:9999/api/reservations/servant/daily-statistics */
router.get('/daily-statistics', authMiddleware, getDailyReservationStatistics)
/* http://localhost:9999/api/reservations/servant/create */
router.post('/create', authMiddleware, servantCreateReservation)
/* http://localhost:9999/api/reservations/servant/view/:reservationId */
router.get('/view/:reservationId', authMiddleware, getReservationDetailById)
/* http://localhost:9999/api/reservations//servant/confirm-not-arrive */
router.post('/confirm-not-arrive', authMiddleware, confirmCustomerNotArrival)
/* http://localhost:9999/api/reservations/servant/delete/:reservationId */
router.delete('/delete/:reservationId', authMiddleware, servantDeleteReservation)
/* http://localhost:9999/api/reservations/servant/clear */
router.delete('/clear', cleanUpCurrentReservations)


module.exports = router;