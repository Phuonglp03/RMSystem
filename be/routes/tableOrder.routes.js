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
/* https://rm-system-4tru.vercel.app//table-orders/servant */
router.get('/servant', authMiddleware, tableOrderController.servantGetAllTableOrders)

/* https://rm-system-4tru.vercel.app//table-orders/servant */
router.post('/servant', authMiddleware, tableOrderController.getTableOrderFromCustomerByReservationCode)

/* https://rm-system-4tru.vercel.app//table-orders/servant/confirm */
router.post('/servant/confirm/:orderId', authMiddleware, tableOrderController.servantConfirmTableOrder)

/* https://rm-system-4tru.vercel.app//table-orders/servant/create */
router.post('/servant/create', authMiddleware, tableOrderController.servantCreateTableOrderForCustomer)

/* https://rm-system-4tru.vercel.app//table-orders/servant/update */
router.put('/servant/update', authMiddleware, tableOrderController.servantUpdateTableOrder)

/* https://rm-system-4tru.vercel.app//table-orders/servant/send */
router.post('/servant/send', authMiddleware, tableOrderController.servantSendTableOrderToChef)

/* https://rm-system-4tru.vercel.app//table-orders/servant/delete */
router.delete('/servant/delete', authMiddleware, tableOrderController.servantDeleteTableOrder)

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

// Route tạo link thanh toán PayOS cho TableOrder
router.post('/payos/create-payment', payosController.createPayment);
// Route webhook PayOS
router.post('/payos/webhook', payosController.handleWebhook);
// Route kiểm tra trạng thái thanh toán
router.get('/payos/check-status/:transactionCode', payosController.checkPaymentStatus);


module.exports = router; 