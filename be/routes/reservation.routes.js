const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const { 
  getAvailableTables,
  createReservation,
  getReservation,
  updateReservationStatus,
  getReservationsFromToday,
  getUserReservations,
  getReservationsByUserId
} = require('../controllers/reservation.controller');

router.get('/tables/available', getAvailableTables);
router.post('/', createReservation);
router.get('/from', getReservationsFromToday);
router.get('/user/history', authMiddleware, getUserReservations);
router.get('/by-user', getReservationsByUserId);
router.get('/:code', getReservation);
router.put('/:code/status', updateReservationStatus);
router.get('/:reservationId/detail', require('../controllers/reservation.controller').getReservationDetail);

module.exports = router;