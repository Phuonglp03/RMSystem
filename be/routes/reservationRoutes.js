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
/* https://rm-system-4tru.vercel.app/api/reservations/servant/unassigned */
router.get('/unassigned', getUnAssignedReservations)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/customer */
router.get('/customer', authMiddleware, getCustomerReservationByServantId)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/confirm-reject/:reservationId */
router.post('/confirm-reject/:reservationId', authMiddleware, confirmOrRejectReservation)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/update */
router.put('/update/:reservationId', authMiddleware, servantUpdateReservationInformation)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/confirm-arrival */
router.post('/confirm-arrival', authMiddleware, confirmCustomerArrival)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/daily-statistics */
router.get('/daily-statistics', authMiddleware, getDailyReservationStatistics)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/create */
router.post('/create', authMiddleware, servantCreateReservation)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/view/:reservationId */
router.get('/view/:reservationId', authMiddleware, getReservationDetailById)
/* https://rm-system-4tru.vercel.app/api/reservations//servant/confirm-not-arrive */
router.post('/confirm-not-arrive', authMiddleware, confirmCustomerNotArrival)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/delete/:reservationId */
router.delete('/delete/:reservationId', authMiddleware, servantDeleteReservation)
/* https://rm-system-4tru.vercel.app/api/reservations/servant/clear */
router.delete('/clear', cleanUpCurrentReservations)


module.exports = router;