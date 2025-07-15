const express = require('express');
const router = express.Router();
const {
    getAllTables,
    getAvailableTableForCreateReservation,
    getAssignedTableByServant
} = require('../controllers/table.controller');
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/all', getAllTables);
/* http://localhost:9999/api/tables/available */
router.post('/available', getAvailableTableForCreateReservation)
/* http://localhost:9999/api/tables/servant/assigned */
router.get('/servant/assigned', authMiddleware, getAssignedTableByServant)

module.exports = router; 