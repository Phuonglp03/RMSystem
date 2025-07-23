const httpErrors = require('http-errors');
const TableOrder = require('../models/TableOrder');
const Reservation = require('../models/Reservation');
const Food = require('../models/Food');
const Combo = require('../models/Combo');
const PayOS = require('@payos/node');

require('dotenv').config();

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

class PayOsController {
    // ✅ PHƯƠNG THỨC MỚI: Tạo thanh toán cho toàn bộ reservation
    async createPaymentForReservation(req, res, next) {
        try {
            const { reservationCode } = req.body;
            console.log('[PayOS] Tạo thanh toán cho reservation:', reservationCode);

            // Tìm reservation
            const reservation = await Reservation.findOne({ reservationCode });
            if (!reservation) {
                throw httpErrors.NotFound('Không tìm thấy đặt bàn');
            }

            // Kiểm tra đã thanh toán chưa
            if (reservation.paymentStatus === 'success') {
                throw httpErrors.BadRequest('Đặt bàn đã được thanh toán');
            }

            // Lấy tất cả TableOrders thuộc reservation này
            const tableOrders = await TableOrder.find({ reservationId: reservation._id })
                .populate('foods.foodId', 'name price')
                .populate('combos', 'name price');

            if (!tableOrders || tableOrders.length === 0) {
                throw httpErrors.BadRequest('Không có đơn đặt món nào để thanh toán');
            }

            // Tính tổng tiền tất cả orders
            let totalAmount = 0;
            const items = [];

            for (const order of tableOrders) {
                // Thêm foods
                if (order.foods && order.foods.length > 0) {
                    order.foods.forEach(f => {
                        if (f.foodId && f.foodId.name && f.foodId.price) {
                            items.push({
                                name: f.foodId.name.substring(0, 25),
                                quantity: f.quantity || 1,
                                price: f.foodId.price,
                            });
                            totalAmount += (f.quantity || 1) * f.foodId.price;
                        }
                    });
                }

                // Thêm combos
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

            // Tạo mã giao dịch cho reservation
            function generateTransactionCodeFromReservationCode(reservationCode) {
                const timestamp = Math.floor(Date.now() / 1000);
                const codeHash = reservationCode.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                const numericCode = Math.abs(codeHash).toString().slice(-6);
                const maxSafePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 1000000);
                const prefix = timestamp % maxSafePrefix;
                return parseInt(prefix.toString() + numericCode);
            }

            const transactionCode = generateTransactionCodeFromReservationCode(reservationCode);

            // Dữ liệu gửi PayOS
            const paymentData = {
                orderCode: transactionCode,
                amount: totalAmount,
                description: `PAYOS${transactionCode.toString().slice(-7)}-${reservationCode}`,
                returnUrl: `${process.env.FRONTEND_URL}/payment-callback?reservationCode=${reservationCode}&transactionCode=${transactionCode}`,
                cancelUrl: `${process.env.FRONTEND_URL}/user-profile/orders`,
                items: items,
            };

            // Gọi API PayOS
            const paymentLinkResponse = await payOS.createPaymentLink(paymentData);

            // Cập nhật reservation với thông tin thanh toán
            reservation.paymentMethod = 'payos';
            reservation.paymentStatus = 'pending';
            reservation.totalAmount = totalAmount;
            reservation.reservation_payment_id = transactionCode.toString();
            await reservation.save();

            return res.status(200).json({
                success: true,
                message: 'Tạo link thanh toán thành công',
                data: {
                    paymentUrl: paymentLinkResponse.checkoutUrl,
                    transactionCode: transactionCode,
                    qrCode: paymentLinkResponse.qrCode,
                    totalAmount: totalAmount,
                    itemCount: items.length,
                },
            });

        } catch (error) {
            console.error('PayOs payment error:', error);
            next(error);
        }
    }

    // ✅ CẬP NHẬT: Webhook xử lý thanh toán reservation
    async handleWebhook(req, res, next) {
        try {
            const webhookData = req.body;
            if (!webhookData || !webhookData.data) {
                return res.status(200).json({ success: true });
            }

            const { orderCode } = webhookData.data;
            
            // Tìm reservation theo reservation_payment_id
            const reservation = await Reservation.findOne({ 
                reservation_payment_id: orderCode.toString() 
            });
            
            if (!reservation) {
                return res.status(200).json({ success: true });
            }

            if (webhookData.code === '00' && webhookData.success === true) {
                // Cập nhật reservation
                reservation.paymentStatus = 'success';
                reservation.status = 'completed';
                reservation.paidAt = new Date();
                await reservation.save();

                // Cập nhật tất cả TableOrders thuộc reservation này
                await TableOrder.updateMany(
                    { reservationId: reservation._id },
                    {
                        paymentStatus: 'success',
                        status: 'completed',
                        paidAt: new Date()
                    }
                );
            } else {
                reservation.paymentStatus = 'failed';
                await reservation.save();
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('PayOs webhook error:', error);
            return res.status(200).json({ success: true });
        }
    }

    // ✅ CẬP NHẬT: Kiểm tra trạng thái thanh toán reservation
    async checkReservationPaymentStatus(req, res, next) {
        try {
            const { reservationCode } = req.params;
            
            const reservation = await Reservation.findOne({ reservationCode })
                .populate('bookedTable', 'tableNumber');
                
            if (!reservation) {
                throw httpErrors.NotFound('Không tìm thấy đặt bàn');
            }

            // Lấy tất cả TableOrders
            const tableOrders = await TableOrder.find({ reservationId: reservation._id })
                .populate('tableId', 'tableNumber')
                .populate('foods.foodId', 'name price');

            res.status(200).json({
                success: true,
                data: {
                    reservation: {
                        id: reservation._id,
                        code: reservation.reservationCode,
                        status: reservation.status,
                        totalAmount: reservation.totalAmount || 0,
                        totalOrders: tableOrders.length,
                        tables: reservation.bookedTable,
                    },
                    payment: {
                        status: reservation.paymentStatus,
                        method: reservation.paymentMethod,
                        transactionCode: reservation.reservation_payment_id,
                        paidAt: reservation.paidAt,
                        updated_at: reservation.updatedAt,
                    },
                    orders: tableOrders
                },
            });
        } catch (error) {
            console.error('Check reservation payment status error:', error);
            next(error);
        }
    }

    // ✅ BACKWARD COMPATIBILITY: Giữ method cũ nhưng redirect sang reservation
    async createPayment(req, res, next) {
        try {
            const { orderId } = req.body;
            
            // Tìm TableOrder và Reservation
            const order = await TableOrder.findById(orderId).populate('reservationId');
            if (!order || !order.reservationId) {
                throw httpErrors.NotFound('Không tìm thấy đơn hàng hoặc đặt bàn');
            }

            // Redirect sang thanh toán reservation
            req.body = { reservationCode: order.reservationId.reservationCode };
            return this.createPaymentForReservation(req, res, next);
            
        } catch (error) {
            console.error('Individual order payment error:', error);
            next(error);
        }
    }

    // Giữ nguyên method checkPaymentStatus cho backward compatibility
    async checkPaymentStatus(req, res, next) {
        try {
            const { transactionCode } = req.params;
            
            // Thử tìm theo reservation trước
            const reservation = await Reservation.findOne({ 
                reservation_payment_id: transactionCode 
            });
            
            if (reservation) {
                return res.status(200).json({
                    success: true,
                    data: {
                        reservation: {
                            id: reservation._id,
                            status: reservation.status,
                            total: reservation.totalAmount || 0,
                        },
                        payment: {
                            status: reservation.paymentStatus === 'success' ? 'PAID' 
                                   : reservation.paymentStatus === 'failed' ? 'FAILED' : 'PENDING',
                            transactionCode: transactionCode,
                            updated_at: reservation.updatedAt,
                        },
                    },
                });
            }

            // Fallback: tìm theo TableOrder (backward compatibility)
            const order = await TableOrder.findOne({ order_payment_id: transactionCode });
            if (!order) {
                throw httpErrors.NotFound('Không tìm thấy giao dịch');
            }

            res.status(200).json({
                success: true,
                data: {
                    order: {
                        id: order._id,
                        status: order.status,
                        total: order.totalprice || 0,
                    },
                    payment: {
                        status: order.paymentStatus === 'success' ? 'PAID' 
                               : order.paymentStatus === 'failed' ? 'FAILED' : 'PENDING',
                        transactionCode: transactionCode,
                        updated_at: order.updatedAt,
                    },
                },
            });
        } catch (error) {
            console.error('Check payment status error:', error);
            next(error);
        }
    }
}

module.exports = new PayOsController();
