const express = require('express');
const router = express.Router();
const tableOrderController = require('../controllers/tableOrder.controller');
const { authMiddleware } = require('../middleware/authMiddleware')

// Tạo nhiều TableOrder cho 1 bookingCode
router.post('/', tableOrderController.createTableOrders);
// Lấy tất cả TableOrder
router.get('/', tableOrderController.getAllTableOrders);

// Lấy TableOrder theo userId
router.get('/user/:userId', tableOrderController.getTableOrdersByUserId);
/* http://localhost:9999/api/table-orders/servant */
router.get('/servant', authMiddleware, tableOrderController.servantGetAllTableOrders)

/* http://localhost:9999/api/table-orders/servant */
router.post('/servant', authMiddleware, tableOrderController.getTableOrderFromCustomerByReservationCode)

/* http://localhost:9999/api/table-orders/servant/confirm */
router.post('/servant/confirm/:orderId', authMiddleware, tableOrderController.servantConfirmTableOrder)

/* http://localhost:9999/api/table-orders/servant/create */
router.post('/servant/create', authMiddleware, tableOrderController.servantCreateTableOrderForCustomer)

/* http://localhost:9999/api/table-orders/servant/update */
router.put('/servant/update', authMiddleware, tableOrderController.servantUpdateTableOrder)

/* http://localhost:9999/api/table-orders/servant/send */
router.post('/servant/send', authMiddleware, tableOrderController.servantSendTableOrderToChef)

/* http://localhost:9999/api/table-orders/servant/delete */
router.delete('/servant/delete', authMiddleware, tableOrderController.servantDeleteTableOrder)

/* http://localhost:9999/api/table-orders/update-item/:orderId/:foodId */
router.patch('/update-item/:orderId/:foodId', authMiddleware, tableOrderController.updateFoodItemStatusInTableOrder);

/* http://localhost:9999/api/table-orders/delete-item/:orderId/:foodId */
router.patch('/delete-item/:orderId/:foodId', authMiddleware, tableOrderController.deleteFoodItemFromTableOrder);

/* http://localhost:9999/api/table-orders/change-table/:orderId */
router.post('/change-table/:orderId', authMiddleware, tableOrderController.servantTransferTableOrderToCustomer);

/* http://localhost:9999/api/table-orders/servant/stats */
router.get('/servant/stats', authMiddleware, tableOrderController.getTableOrderStats);
// Lấy TableOrder theo ID
router.get('/:id', tableOrderController.getTableOrderById);
// Cập nhật TableOrder
router.put('/:id', tableOrderController.updateTableOrder);
// Xóa TableOrder
router.delete('/:id', tableOrderController.deleteTableOrder);
router.get('/reservation/by-code/:code', tableOrderController.getReservationByCode);
// Lấy TableOrder theo reservationId



module.exports = router; 