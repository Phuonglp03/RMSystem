const express = require('express');
const router = express.Router();
const servantController = require('../controllers/servant.controller');

router.get('/tables/all-with-status', servantController.getAllTablesWithStatus);

// Reservation management
router.get('/reservations', servantController.getAllReservations);
router.get('/reservations/:id', servantController.getReservationDetail);
router.put('/reservations/:id/status', servantController.updateReservationStatus);
router.put('/reservations/:id', servantController.updateReservation);

module.exports = router;
