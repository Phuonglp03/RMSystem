const httpErrors = require('http-errors');
const TableOrder = require('../models/TableOrder');
const Food = require('../models/Food');
const Combo = require('../models/Combo');
const PayOS = require('@payos/node');
require('dotenv').config();

// Khởi tạo instance của PayOS
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

class PayOsController {
  // Tạo link thanh toán PayOS cho TableOrder
    async createPayment(req, res, next) {
        try {
        const { orderId } = req.body;
        console.log('[PayOS] Nhận yêu cầu tạo link thanh toán cho orderId (từ FE):', orderId);
        // Tìm đơn hàng
        const order = await TableOrder.findById(orderId)
            .populate('foods.foodId', 'name price')
            .populate('combos');
        console.log('[PayOS] _id thực tế của TableOrder trong DB:', order ? order._id : null);
        if (!order) {
            console.error('[PayOS] Không tìm thấy đơn hàng với orderId:', orderId);
            throw httpErrors.NotFound('Không tìm thấy đơn hàng');
        }
        if (order.status === 'completed' || order.paymentStatus === 'success') {
            console.warn('[PayOS] Đơn hàng đã thanh toán hoặc hoàn thành:', orderId);
            throw httpErrors.BadRequest('Đơn hàng đã thanh toán hoặc hoàn thành');
        }
        // Tạo mã giao dịch duy nhất
        function generateTransactionCodeFromOrderId(orderId) {
            const timestamp = Math.floor(Date.now() / 1000);
            const lastSixChars = orderId.toString().slice(-6);
            let numericCode = '';
            for (let i = 0; i < lastSixChars.length; i++) {
            numericCode += lastSixChars.charCodeAt(i) % 10;
            }
            numericCode = numericCode.slice(0, 6);
            const maxSafePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 1000000);
            const prefix = timestamp % maxSafePrefix;
            const transactionCode = parseInt(prefix.toString() + numericCode);
            return transactionCode;
        }
        const transactionCode = generateTransactionCodeFromOrderId(orderId);
        // Chuẩn bị items cho PayOS
        const items = [];
        if (order.foods && order.foods.length > 0) {
            order.foods.forEach(f => {
            items.push({
                name: f.foodId && f.foodId.name ? f.foodId.name.substring(0, 25) : 'Món ăn',
                quantity: f.quantity || 1,
                price: f.foodId && f.foodId.price ? f.foodId.price : 0,
            });
            });
        }
        if (order.combos && order.combos.length > 0) {
            for (const comboId of order.combos) {
            const combo = await Combo.findById(comboId);
            if (combo) {
                items.push({
                name: combo.name.substring(0, 25),
                quantity: 1,
                price: combo.price || 0,
                });
            }
            }
        }
        // Dữ liệu gửi PayOS
        const lastSevenDigits = transactionCode.toString().slice(-7);
        const paymentData = {
            orderCode: transactionCode,
            amount: order.totalprice,
            description: `PAYOS${lastSevenDigits}`,
            returnUrl: `${process.env.FRONTEND_URL}/payment-callback?orderId=${orderId}&transactionCode=${transactionCode}`,
            cancelUrl: `${process.env.FRONTEND_URL}/user-profile/orders`,
            items: items,
        };
        console.log('[PayOS] Dữ liệu gửi PayOS:', paymentData);
        // Gọi API PayOS tạo link thanh toán
        let paymentLinkResponse;
        try {
            paymentLinkResponse = await payOS.createPaymentLink(paymentData);
            console.log('[PayOS] Nhận response từ PayOS:', paymentLinkResponse);
        } catch (err) {
            console.error('[PayOS] Lỗi khi gọi createPaymentLink:', err);
            throw err;
        }
        // Lưu thông tin thanh toán vào order
        order.paymentMethod = 'payos';
        order.paymentStatus = 'pending';
        order.order_payment_id = transactionCode.toString();
        console.log('[PayOS] Trước khi save order:', {
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            order_payment_id: order.order_payment_id
        });
        try {
            await order.save();
            const updatedOrder = await TableOrder.findById(orderId);
            console.log('[PayOS] Order sau khi save:', updatedOrder);
            if (!updatedOrder || updatedOrder.paymentMethod !== 'payos' || updatedOrder.paymentStatus !== 'pending' || updatedOrder.order_payment_id !== transactionCode.toString()) {
                console.error('[PayOS] Lưu order không thành công hoặc không cập nhật đúng trường!');
                return res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái thanh toán cho đơn hàng.' });
            }
        } catch (err) {
            console.error('[PayOS] Lỗi khi save order:', err);
            return res.status(500).json({ success: false, message: 'Lỗi khi lưu trạng thái thanh toán cho đơn hàng.' });
        }
        console.log('[PayOS] Đã save order:', order._id);
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
        console.error('PayOs payment error:', error);
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
      const order = await TableOrder.findOne({ order_payment_id: orderCode.toString() });
      if (!order) return res.status(200).json({ success: true });
      if (webhookData.code === '00' && webhookData.success === true) {
        order.paymentStatus = 'success';
        order.status = 'completed';
        order.paidAt = new Date();
      } else {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
      }
      await order.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('PayOs webhook error:', error);
      if (!res.headersSent) {
        return res.status(200).json({ success: true });
      }
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(req, res, next) {
    try {
      const { transactionCode } = req.params;
      const order = await TableOrder.findOne({ order_payment_id: transactionCode.toString() });
      if (!order) throw httpErrors.NotFound('Không tìm thấy đơn hàng với mã giao dịch này');
      let paymentStatus = { status: 'UNKNOWN' };
      paymentStatus = {
        status:
          order.paymentStatus === 'success'
            ? 'PAID'
            : order.paymentStatus === 'failed'
            ? 'FAILED'
            : 'PENDING',
      };
      res.status(200).json({
        success: true,
        data: {
          order: {
            id: order._id,
            status: order.status,
            total: order.totalprice || 0,
          },
          payment: {
            status: paymentStatus.status,
            transactionCode: transactionCode,
            updated_at: order.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error('Check payment status error:', error);
      if (!res.headersSent) {
        next(error);
      }
    }
  }
}

module.exports = new PayOsController(); 