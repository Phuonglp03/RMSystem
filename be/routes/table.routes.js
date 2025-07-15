const express = require('express');
const router = express.Router();
const {
    getAllTables,
    getAvailableTableForCreateReservation,
    getAssignedTableByServant
} = require('../controllers/table.controller');
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/all', getAllTables);
/* https://rm-system-4tru.vercel.app//tables/available */
router.post('/available', getAvailableTableForCreateReservation)
/* https://rm-system-4tru.vercel.app//tables/servant/assigned */
router.get('/servant/assigned', authMiddleware, getAssignedTableByServant)

module.exports = router; 