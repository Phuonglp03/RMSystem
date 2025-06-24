const express = require('express');
const router = express.Router();
const {
    getAllTables,
    getAvailableTableForCreateReservation
} = require('../controllers/table.controller');


router.get('/all', getAllTables);

/* http://localhost:9999/api/tables/available */
router.post('/available', getAvailableTableForCreateReservation)

module.exports = router; 