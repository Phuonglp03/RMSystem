const express = require('express');
const router = express.Router();
const payosReservationController = require('../controllers/payosReservation.controller');

// Tạo link thanh toán PayOS cho Reservation
router.post('/create-payment', payosReservationController.createPayment);
// Webhook PayOS
router.post('/webhook', payosReservationController.handleWebhook);
// Check trạng thái thanh toán
router.get('/check-status/:transactionCode', payosReservationController.checkPaymentStatus);

module.exports = router; 