const express = require('express');
const router = express.Router();

const { getAvailableTables,
    createReservation,
    getReservation,
    getReservationsFromToday } = require('../controllers/reservation.controller');

router.get('/tables/available', getAvailableTables);
router.post('/', createReservation);
router.get('/from', getReservationsFromToday);
router.get('/:code', getReservation);


module.exports = router;