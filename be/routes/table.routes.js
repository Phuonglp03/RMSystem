const express = require('express');
const router = express.Router();
const {
    getAllTables,
    getAvailableTableForCreateReservation,
    getAssignedTableByServant,
    createTable,
    updateTable,
    deleteTable
} = require('../controllers/table.controller');
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/all', getAllTables);
/* https://rm-system-4tru.vercel.app/api/tables/available */
router.post('/available', getAvailableTableForCreateReservation)
/* https://rm-system-4tru.vercel.app/api/tables/servant/assigned */
router.get('/servant/assigned', authMiddleware, getAssignedTableByServant)
// Route cho admin quản lý bàn
router.post('/', createTable); // Tạo bàn mới
router.put('/:id', updateTable); // Cập nhật bàn
router.delete('/:id', deleteTable); // Xóa bàn

module.exports = router; 