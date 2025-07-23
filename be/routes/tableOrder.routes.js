const express = require('express');
const router = express.Router();
const tableOrderController = require('../controllers/tableOrder.controller');
const { authMiddleware } = require('../middleware/authMiddleware')
const payosController = require('../controllers/payos.controller');

// Tạo nhiều TableOrder cho 1 bookingCode
router.post('/', tableOrderController.createTableOrders);
// Lấy tất cả TableOrder
router.get('/', tableOrderController.getAllTableOrders);

// Lấy TableOrder theo userId
router.get('/user/:userId', tableOrderController.getTableOrdersByUserId);

/* https://rm-system-4tru.vercel.app//table-orders/update-item/:orderId/:foodId */
router.patch('/update-item/:orderId/:foodId', authMiddleware, tableOrderController.updateFoodItemStatusInTableOrder);

/* https://rm-system-4tru.vercel.app//table-orders/delete-item/:orderId/:foodId */
router.patch('/delete-item/:orderId/:foodId', authMiddleware, tableOrderController.deleteFoodItemFromTableOrder);

/* https://rm-system-4tru.vercel.app//table-orders/change-table/:orderId */
router.post('/change-table/:orderId', authMiddleware, tableOrderController.servantTransferTableOrderToCustomer);

/* https://rm-system-4tru.vercel.app//table-orders/servant/stats */
router.get('/servant/stats', authMiddleware, tableOrderController.getTableOrderStats);
// Lấy TableOrder theo ID
router.get('/:id', tableOrderController.getTableOrderById);
// Cập nhật TableOrder
router.put('/:id', tableOrderController.updateTableOrder);
// Xóa TableOrder
router.delete('/:id', tableOrderController.deleteTableOrder);
router.get('/reservation/by-code/:code', tableOrderController.getReservationByCode);
// Lấy TableOrder theo reservationId
router.get('/reservation/:reservationId', tableOrderController.getTableOrdersByReservationId);

// Route tạo link thanh toán PayOS cho TableOrder
router.post('/payos/create-payment', payosController.createPayment);
// Route webhook PayOS
router.post('/payos/webhook', payosController.handleWebhook);
// Route kiểm tra trạng thái thanh toán
router.get('/payos/check-status/:transactionCode', payosController.checkPaymentStatus);

// Thêm route xác nhận thanh toán tiền mặt
router.patch('/:id/confirm-cash', require('../controllers/tableOrder.controller').confirmCashPayment);


module.exports = router; 