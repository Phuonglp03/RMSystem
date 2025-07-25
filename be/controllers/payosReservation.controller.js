const httpErrors = require('http-errors');
const Reservation = require('../models/Reservation');
const TableOrder = require('../models/TableOrder');
const Combo = require('../models/Combo');
const Food = require('../models/Food');
const PayOS = require('@payos/node');
const Table = require('../models/Table');
require('dotenv').config();

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

class PayosReservationController {
  // Tạo link thanh toán PayOS cho Reservation
  async createPayment(req, res, next) {
    try {
      const { reservationCode } = req.body;
      if (!reservationCode) {
        return res.status(400).json({ success: false, message: 'Thiếu mã đặt bàn (reservationCode)' });
      }
      // Tìm reservation
      const reservation = await Reservation.findOne({ reservationCode })
        .populate('bookedTable', 'tableNumber')
        .populate('customerId', 'fullname email phone');
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });
      }
      // Lấy các TableOrder đã completed của reservation này
      const tableOrders = await TableOrder.find({ reservationId: reservation._id, status: 'completed' })
        .populate('foods.foodId', 'name price')
        .populate('combos');
      if (!tableOrders.length) {
        return res.status(400).json({ success: false, message: 'Không có đơn đặt món nào đã hoàn thành để thanh toán.' });
      }
      // Tính tổng tiền
      let totalAmount = 0;
      const items = [];
      for (const order of tableOrders) {
        // Món ăn
        if (order.foods && order.foods.length > 0) {
          order.foods.forEach(f => {
            items.push({
              name: f.foodId && f.foodId.name ? f.foodId.name.substring(0, 25) : 'Món ăn',
              quantity: f.quantity || 1,
              price: f.foodId && f.foodId.price ? f.foodId.price : 0,
            });
            totalAmount += (f.foodId && f.foodId.price ? f.foodId.price : 0) * (f.quantity || 1);
          });
        }
        // Combo
        if (order.combos && order.combos.length > 0) {
          for (const comboId of order.combos) {
            const combo = await Combo.findById(comboId);
            if (combo) {
              items.push({
                name: combo.name.substring(0, 25),
                quantity: 1,
                price: combo.price || 0,
              });
              totalAmount += combo.price || 0;
            }
          }
        }
      }
      // Tạo mã giao dịch duy nhất cho reservation
      function generateTransactionCodeFromReservation(reservationCode) {
        const timestamp = Math.floor(Date.now() / 1000);
        const codePart = reservationCode.slice(-6);
        let numericCode = '';
        for (let i = 0; i < codePart.length; i++) {
          numericCode += codePart.charCodeAt(i) % 10;
        }
        numericCode = numericCode.slice(0, 6);
        const maxSafePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 1000000);
        const prefix = timestamp % maxSafePrefix;
        const transactionCode = parseInt(prefix.toString() + numericCode);
        return transactionCode;
      }
      const transactionCode = generateTransactionCodeFromReservation(reservationCode);
      // Dữ liệu gửi PayOS
      const lastSevenDigits = transactionCode.toString().slice(-7);
      const paymentData = {
        orderCode: transactionCode,
        amount: totalAmount,
        description: `PAYOS${lastSevenDigits}`,
        returnUrl: `${process.env.FRONTEND_URL}/payment-callback?reservationCode=${reservationCode}&transactionCode=${transactionCode}`,
        cancelUrl: `${process.env.FRONTEND_URL}/user-profile/orders`,
        items: items,
      };
      console.log('[PayOS] paymentData gửi PayOS:', paymentData);
      let paymentLinkResponse;
      try {
        paymentLinkResponse = await payOS.createPaymentLink(paymentData);
      } catch (err) {
        console.error('[PayOS] Lỗi khi tạo link thanh toán PayOS:', err && err.message, err && err.response && err.response.data);
        return res.status(500).json({ success: false, message: 'Lỗi khi tạo link thanh toán PayOS', error: err.message, detail: err.response && err.response.data });
      }
      // Lưu trạng thái vào reservation
      reservation.status = 'completed';
      reservation.paymentMethod = 'payos';
      reservation.paymentStatus = 'pending';
      reservation.reservation_payment_id = transactionCode.toString();
      reservation.totalAmount = totalAmount;
      
      await reservation.save();
      if (Array.isArray(reservation.bookedTable)) {
        await Table.updateMany(
          { _id: { $in: reservation.bookedTable } },
          { $pull: { currentReservation: reservation._id } }
        );
      }
      return res.status(200).json({
        success: true,
        message: 'Tạo link thanh toán thành công',
        data: {
          paymentUrl: paymentLinkResponse.checkoutUrl,
          transactionCode: transactionCode,
          qrCode: paymentLinkResponse.qrCode,
        },
      });
    } catch (error) {
      next(error.isJoi ? httpErrors.BadRequest(error.message) : error);
    }
  }

  // Xử lý webhook từ PayOS
  async handleWebhook(req, res, next) {
    try {
      const webhookData = req.body;
      if (!webhookData || !webhookData.data) {
        return res.status(200).json({ success: true });
      }
      const { orderCode, status, amount } = webhookData.data;
      const reservation = await Reservation.findOne({ reservation_payment_id: orderCode.toString() });
      if (!reservation) return res.status(200).json({ success: true });
      if (webhookData.code === '00' && webhookData.success === true) {
        reservation.status = 'completed';
        reservation.paymentStatus = 'success';
        reservation.paidAt = new Date();
        await reservation.save();
        // Cập nhật tất cả TableOrder liên quan
        await TableOrder.updateMany(
          { reservationId: reservation._id, status: 'completed' },
          { $set: { paymentStatus: 'success', paymentMethod: 'payos', paidAt: new Date() } }
        );

        
        // Thêm reservationId vào reservationHistory của customer (robust)
        let customerId = null;
        if (Array.isArray(reservation.customerId) && reservation.customerId.length > 0) {
          if (typeof reservation.customerId[0] === 'string' || (typeof reservation.customerId[0] === 'object' && reservation.customerId[0]._bsontype === 'ObjectID')) {
            customerId = reservation.customerId[0];
          } else if (reservation.customerId[0]._id) {
            customerId = reservation.customerId[0]._id;
          }
        } else if (reservation.customerId && reservation.customerId._id) {
          customerId = reservation.customerId._id;
        } else if (reservation.customerId) {
          customerId = reservation.customerId;
        }
        if (customerId) {
          const Customer = require('../models/Customer');
          const customer = await Customer.findById(customerId);
          if (customer && !customer.reservationHistory.includes(reservation._id)) {
            customer.reservationHistory.push(reservation._id);
            await customer.save();
          }
        }
      } else {
        reservation.paymentStatus = 'failed';
        await reservation.save();
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      if (!res.headersSent) {
        return res.status(200).json({ success: true });
      }
    }
  }

  // Kiểm tra trạng thái thanh toán Reservation
  async checkPaymentStatus(req, res, next) {
    try {
      const { transactionCode } = req.params;
      const reservation = await Reservation.findOne({ reservation_payment_id: transactionCode.toString() });
      if (!reservation) throw httpErrors.NotFound('Không tìm thấy đặt bàn với mã giao dịch này');
      let paymentStatus = { status: 'UNKNOWN' };
      paymentStatus = {
        status:
          reservation.paymentStatus === 'success'
            ? 'PAID'
            : reservation.paymentStatus === 'failed'
            ? 'FAILED'
            : 'PENDING',
      };
      res.status(200).json({
        success: true,
        data: {
          reservation: {
            id: reservation._id,
            status: reservation.status,
            total: reservation.totalAmount || 0,
          },
          payment: {
            status: paymentStatus.status,
            transactionCode: transactionCode,
            updated_at: reservation.updatedAt,
          },
        },
      });
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      }
    }
  }
}

module.exports = new PayosReservationController(); 