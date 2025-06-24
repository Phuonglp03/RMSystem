import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../services/axios.service';

const statusColor = {
  pending: '#ff9800',
  confirmed: '#2196f3',
  preparing: '#00bcd4',
  ready_to_serve: '#4caf50',
  served: '#8bc34a',
  completed: '#607d8b',
  cancelled: '#f44336',
};

const statusLabel = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị',
  ready_to_serve: 'Sẵn sàng phục vụ',
  served: 'Đã phục vụ',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const OrderHistoryByUser = () => {
  const [ordersGroup, setOrdersGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
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
      const data = Array.isArray(response.data) ? response.data : response.data.data;
      setOrdersGroup(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Lỗi khi lấy lịch sử order');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const renderOrderDetails = (order) => {
    const hasFoods = order.foods && Array.isArray(order.foods) && order.foods.length > 0;
    const hasCombos = order.combos && Array.isArray(order.combos) && order.combos.length > 0;
    return (
      <div style={{padding: 8}}>
        <div style={{fontWeight: 600, marginBottom: 4}}>Món ăn:</div>
        {hasFoods ? (
          <ul style={{margin: 0, paddingLeft: 20}}>
            {order.foods.map((item, idx) => (
              <li key={idx} style={{marginBottom: 2}}>
                <span role="img" aria-label="food">🍽️</span> {item.foodId?.name || 'Món ăn'}
                {item.quantity ? ` x${item.quantity}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{color: '#888'}}>Không có món ăn nào.</div>
        )}
        <div style={{fontWeight: 600, margin: '8px 0 4px'}}>Combo:</div>
        {hasCombos ? (
          <ul style={{margin: 0, paddingLeft: 20}}>
            {order.combos.map((combo, idx) => (
              <li key={idx} style={{marginBottom: 2}}>
                <span role="img" aria-label="combo">🎁</span> {combo.comboId?.name || combo.name || 'Combo'}
                {combo.quantity ? ` x${combo.quantity}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{color: '#888'}}>Không có combo nào.</div>
        )}
      </div>
    );
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Đang tải lịch sử order...</div>;
  if (error) return <div style={{color: 'red', textAlign: 'center', marginTop: 40}}>Lỗi: {error}</div>;

  return (
    <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', marginBottom: 32}}>Lịch sử đặt món của bạn</h2>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 16}}>
        <button
          onClick={fetchOrders}
          style={{padding: '8px 20px', borderRadius: 6, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px #c8e6c9'}}
        >
          🔄 Làm mới
        </button>
      </div>
      {(!Array.isArray(ordersGroup) || ordersGroup.length === 0) ? (
        <div style={{textAlign: 'center', color: '#888'}}>Bạn chưa có order nào.</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
          {ordersGroup.map(group => (
            <div key={group.reservationId} style={{background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #eee', padding: 24, marginBottom: 0}}>
              <div style={{marginBottom: 18, borderBottom: '1.5px solid #e0e0e0', paddingBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center'}}>
                <span><b>Mã đặt bàn:</b> {group.reservationInfo?.reservationCode || group.reservationId}</span>
                <span><b>Ngày đặt:</b> {group.reservationInfo?.createdAt ? new Date(group.reservationInfo.createdAt).toLocaleString() : ''}</span>
                <span><b>Số người:</b> {group.reservationInfo?.numberOfPeople || ''}</span>
                {group.reservationInfo?.note && <span><b>Ghi chú:</b> {group.reservationInfo.note}</span>}
              </div>
              <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: 0}}>
                <thead style={{background: '#f5f5f5'}}>
                  <tr>
                    <th style={{padding: 12, borderBottom: '2px solid #e0e0e0'}}>Số bàn</th>
                    <th style={{padding: 12, borderBottom: '2px solid #e0e0e0'}}>Trạng thái</th>
                    <th style={{padding: 12, borderBottom: '2px solid #e0e0e0'}}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {group.orders.map(order => (
                    <tr key={order._id} style={{borderBottom: '1px solid #f0f0f0', background: expandedOrder === order._id ? '#f9f9fc' : '#fff'}}>
                      <td style={{textAlign: 'center', padding: 10, fontWeight: 500}}>{order.tableId?.tableNumber ?? ''}</td>
                      <td style={{textAlign: 'center', padding: 10}}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 16,
                          background: statusColor[order.status] || '#eee',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 13
                        }}>
                          {statusLabel[order.status] || order.status || 'N/A'}
                        </span>
                      </td>
                      <td style={{textAlign: 'center', padding: 10}}>
                        <button 
                          style={{padding: '6px 18px', borderRadius: 6, border: 'none', background: '#2196f3', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: expandedOrder === order._id ? '0 2px 8px #b3e5fc' : 'none'}} 
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                        >
                          {expandedOrder === order._id ? 'Ẩn' : 'Xem'}
                        </button>
                        {expandedOrder === order._id && (
                          <div style={{marginTop: 12, textAlign: 'left', background: '#f7faff', border: '1px solid #e3f2fd', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px #e3f2fd'}}>
                            {renderOrderDetails(order)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryByUser; 