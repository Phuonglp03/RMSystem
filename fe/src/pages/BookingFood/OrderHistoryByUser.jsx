import React, { useEffect, useState } from 'react';
import axios from '../../services/axios.service';

const OrderHistoryByUser = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const userID = localStorage.getItem('userID');
        if (!userID) {
          setError('Không tìm thấy userID. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`/api/table-orders/user/${userID}`);
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.message || 'Lỗi khi lấy lịch sử order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Đang tải lịch sử order...</div>;
  if (error) return <div style={{color: 'red'}}>Lỗi: {error}</div>;

  return (
    <div style={{padding: 24}}>
      <h2>Lịch sử order của bạn</h2>
      {(!Array.isArray(orders) || orders.length === 0) ? (
        <div>Bạn chưa có order nào.</div>
      ) : (
        <table border="1" cellPadding="8" style={{width: '100%', marginTop: 16}}>
          <thead>
            <tr>
              <th>Mã Order</th>
              <th>Bàn</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.tableId?.tableNumber ?? order.tableId?._id ?? ''}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td>
                <td>{order.status || 'N/A'}</td>
                <td>
                  <pre style={{whiteSpace: 'pre-wrap', textAlign: 'left'}}>{JSON.stringify(order, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistoryByUser; 