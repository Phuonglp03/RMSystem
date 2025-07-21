import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tableService from '../../services/table.service';
import { toast, ToastContainer } from 'react-toastify';

const TableOrderPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const reservationCodeFromUrl = query.get('code') || '';

  const [reservationCode, setReservationCode] = useState(reservationCodeFromUrl);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'online'
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (reservationCode) {
      fetchOrders(reservationCode);
    }
    // eslint-disable-next-line
  }, [reservationCode]);

  const fetchOrders = async (code) => {
    setLoading(true);
    try {
      // Giả lập lấy đơn đặt món theo reservationCode
      const res = await tableService.getTableOrderFromCustomerByReservationCode(code);
      // Có thể cần xử lý lại dữ liệu trả về
      setOrders(res.tableOrder || res.data || []);
    } catch (err) {
      toast.error('Không tìm thấy đơn đặt món với mã này');
      setOrders([]);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    // Giả lập thanh toán
    setPaid(true);
    toast.success('Thanh toán thành công!');
    setTimeout(() => navigate('/servant/manage-tableOrder'), 1500);
  };

  const totalAmount = Array.isArray(orders)
    ? orders.reduce((sum, o) => sum + (o.totalprice || 0), 0)
    : 0;

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 style={{ marginBottom: 18 }}>Thanh toán đơn đặt món</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (reservationCode) fetchOrders(reservationCode);
        }}
        style={{ marginBottom: 18 }}
      >
        <label style={{ fontWeight: 500 }}>Mã đặt bàn:</label>
        <input
          value={reservationCode}
          onChange={e => setReservationCode(e.target.value)}
          placeholder="Nhập mã đặt bàn"
          style={{ marginLeft: 10, padding: '6px 12px', borderRadius: 5, border: '1px solid #d9d9d9', fontSize: 16 }}
          disabled={!!reservationCodeFromUrl}
        />
        {!reservationCodeFromUrl && (
          <button type="submit" style={{ marginLeft: 12, padding: '6px 18px', borderRadius: 5, background: '#1890ff', color: '#fff', border: 'none', fontWeight: 500 }}>Tìm</button>
        )}
      </form>
      {loading ? (
        <div>Đang tải đơn đặt món...</div>
      ) : orders.length === 0 ? (
        <div>Không có đơn đặt món nào cho mã này.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <b>Danh sách đơn đặt món:</b>
            <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
              {orders.map((order, idx) => (
                <li key={order._id || idx} style={{ marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 6 }}>
                  <div><b>Bàn:</b> {order.tableId?.tableNumber || order.tableNumber || '---'}</div>
                  <div><b>Tổng tiền:</b> {order.totalprice?.toLocaleString()}đ</div>
                  <div><b>Trạng thái:</b> {order.status}</div>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Tổng cộng:</b> <span style={{ color: '#1890ff', fontSize: 18 }}>{totalAmount.toLocaleString()}đ</span>
          </div>
          <div style={{ marginBottom: 18 }}>
            <b>Chọn phương thức thanh toán:</b>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />{' '}
              Tiền mặt
            </label>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />{' '}
              Online
            </label>
          </div>
          <button
            onClick={handlePayment}
            disabled={paid}
            style={{ background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontSize: 17, fontWeight: 600, cursor: 'pointer' }}
          >
            {paid ? 'Đã thanh toán' : 'Xác nhận thanh toán'}
          </button>
        </>
      )}
    </div>
  );
};

export default TableOrderPayment; 