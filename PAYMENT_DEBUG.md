# Hướng dẫn Debug Thanh toán PayOS

## Các vấn đề đã được sửa:

### 1. Cấu hình CORS
- ✅ Cập nhật `be/config/corsOption.js` để cho phép domain `www.rmsystem.store`
- ✅ Thêm các domain development và production

### 2. Cấu hình Axios
- ✅ Sửa `fe/src/services/axios.service.js` để tự động detect domain
- ✅ Sử dụng localhost khi development, production URL khi production

### 3. Webhook Handler
- ✅ Cải thiện `be/controllers/payos.controller.js` để xử lý nhiều format webhook
- ✅ Thêm logging chi tiết cho webhook và check-status API

### 4. Frontend Payment Callback
- ✅ Sửa lỗi vòng lặp vô hạn trong `fe/src/pages/payment-callback.jsx`
- ✅ Cải thiện error handling và logging

## Cách kiểm tra và debug:

### 1. Kiểm tra Backend Logs
```bash
# Trong backend console, tìm các log:
[PayOS] Nhận yêu cầu tạo link thanh toán cho orderId
[PayOS] Dữ liệu gửi PayOS
[PayOS] Nhận response từ PayOS
[PayOS Webhook] Nhận webhook data
[PayOS Check Status] Kiểm tra transactionCode
```

### 2. Kiểm tra Frontend Logs
```bash
# Trong browser console, tìm các log:
[FE] Gọi API checkPayosPaymentStatus với transactionCode
[FE] Nhận response checkPayosPaymentStatus
[Table Service] Gọi checkPayosPaymentStatus với transactionCode
[Axios Response] /api/table-orders/payos/check-status/
```

### 3. Kiểm tra Network Tab
- Mở DevTools > Network
- Tìm các request đến `/api/table-orders/payos/`
- Kiểm tra status code và response

### 4. Kiểm tra Database
```javascript
// Trong MongoDB, kiểm tra TableOrder collection:
db.tableorders.findOne({ order_payment_id: "YOUR_TRANSACTION_CODE" })
```

## Cấu hình cần thiết:

### 1. Environment Variables (Backend)
```env
FRONTEND_URL=https://www.rmsystem.store
CORS_ORIGIN=https://www.rmsystem.store
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

### 2. PayOS Dashboard Configuration
- **Webhook URL**: `https://rm-system-4tru.vercel.app/api/table-orders/payos/webhook`
- **Return URL**: Sẽ tự động được set thành `https://www.rmsystem.store/payment-callback`

## Quy trình thanh toán:

1. **Tạo thanh toán**: Frontend gọi `/api/table-orders/payos/create-payment`
2. **Redirect**: User được redirect đến PayOS để thanh toán
3. **Webhook**: PayOS gửi webhook về backend khi thanh toán hoàn tất
4. **Callback**: User được redirect về `/payment-callback`
5. **Check Status**: Frontend gọi `/api/table-orders/payos/check-status/{id}` để kiểm tra

## Troubleshooting:

### Lỗi CORS
- Kiểm tra domain trong `corsOption.js`
- Đảm bảo backend và frontend đúng domain

### Webhook không nhận được
- Kiểm tra webhook URL trong PayOS dashboard
- Kiểm tra backend logs
- Đảm bảo backend có thể nhận POST requests

### Trạng thái không cập nhật
- Kiểm tra webhook handler logs
- Kiểm tra database để xem paymentStatus có được cập nhật không
- Kiểm tra API check-status response

### Frontend không hiển thị đúng
- Kiểm tra browser console logs
- Kiểm tra Network tab để xem API calls
- Đảm bảo response format đúng 