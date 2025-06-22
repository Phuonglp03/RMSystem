const express = require('express');
const router = express.Router();
const tableOrderController = require('../controllers/tableOrder.controller');

// Tạo nhiều TableOrder cho 1 bookingCode
router.post('/', tableOrderController.createTableOrders);
// Lấy tất cả TableOrder
router.get('/', tableOrderController.getAllTableOrders);
// Lấy TableOrder theo ID
router.get('/:id', tableOrderController.getTableOrderById);
// Cập nhật TableOrder
router.put('/:id', tableOrderController.updateTableOrder);
// Xóa TableOrder
router.delete('/:id', tableOrderController.deleteTableOrder);
// Lấy TableOrder theo bookingCode
router.get('/reservation/by-code/:code', tableOrderController.getReservationByCode);
// Lấy TableOrder theo reservationId
router.get('/reservation/:reservationId', tableOrderController.getTableOrdersByReservationId);
// Lấy TableOrder theo customerId
// router.get('/customer/:customerId', tableOrderController.getTableOrdersByCustomerId);
// Lấy TableOrder theo userId
router.get('/user/:userId', tableOrderController.getTableOrdersByUserId);

module.exports = router; 