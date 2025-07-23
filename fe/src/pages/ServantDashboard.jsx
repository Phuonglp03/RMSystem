import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Button, Typography, message, Modal, Tag } from 'antd';
import tableService from '../services/table.service';

const { Title, Text } = Typography;

const ServantDashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await tableService.getAllTables();
      setTables(res.tables || []);
    } catch (err) {
      message.error('Không lấy được danh sách bàn');
    }
    setLoading(false);
  };

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    try {
      const res = await tableService.getOrdersByReservationId(table.currentReservation?.[0] || '');
      setOrders(res || []);
    } catch (err) {
      setOrders([]);
    }
  };

  // Lọc đơn completed chưa thanh toán
  const completedUnpaidOrders = orders.filter(o => o.status === 'completed' && o.paymentStatus !== 'success');

  const handleCashPayment = async (orderId) => {
    Modal.confirm({
      title: 'Xác nhận thanh toán tiền mặt',
      content: 'Bạn chắc chắn muốn xác nhận đã thanh toán tiền mặt cho đơn này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setPaying(true);
        try {
          // Gọi API cập nhật trạng thái thanh toán tiền mặt cho order (bạn cần tạo API này ở backend)
          await tableService.confirmCashPayment(orderId);
          message.success('Đã xác nhận thanh toán tiền mặt!');
          // Refresh lại orders
          if (selectedTable) handleSelectTable(selectedTable);
        } catch (err) {
          message.error('Lỗi khi xác nhận thanh toán');
        }
        setPaying(false);
      }
    });
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)' }}>
      <Title level={2} style={{ marginBottom: 32 }}>Quản lý bàn (Servant)</Title>
      <Row gutter={32}>
        {/* Danh sách bàn */}
        <Col xs={24} md={16} lg={16} xl={16} style={{ minHeight: 500 }}>
          <Card title={<b>Danh sách bàn</b>} bordered style={{ borderRadius: 12, minHeight: 500 }} loading={loading}>
            <List
              dataSource={tables}
              renderItem={table => (
                <List.Item
                  key={table._id}
                  style={{
                    background: selectedTable?._id === table._id ? '#e0e7ff' : '#fff',
                    borderRadius: 8,
                    marginBottom: 10,
                    cursor: 'pointer',
                    border: selectedTable?._id === table._id ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                    boxShadow: selectedTable?._id === table._id ? '0 2px 8px #6366f122' : 'none',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleSelectTable(table)}
                >
                  <div>
                    <Text strong>Bàn {table.tableNumber}</Text> <Tag color={table.status ? 'green' : 'red'}>{table.status ? 'Trống' : 'Đang sử dụng'}</Tag>
                    <div style={{ fontSize: 14, color: '#888' }}>Sức chứa: {table.capacity}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        {/* Thông tin chi tiết bàn */}
        <Col xs={24} md={8} lg={8} xl={8}>
          <Card title={<b>Thông tin bàn</b>} bordered style={{ borderRadius: 12, minHeight: 500 }}>
            {!selectedTable ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 80 }}>Chọn một bàn để xem chi tiết</div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Bàn số: {selectedTable.tableNumber}</Text><br />
                  <Text>Sức chứa: {selectedTable.capacity}</Text><br />
                  <Text>Trạng thái: <Tag color={selectedTable.status ? 'green' : 'red'}>{selectedTable.status ? 'Trống' : 'Đang sử dụng'}</Tag></Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Đơn đã đặt:</Title>
                  {orders.length === 0 ? (
                    <Text type="secondary">Chưa có đơn nào cho bàn này.</Text>
                  ) : (
                    <List
                      dataSource={orders}
                      renderItem={order => (
                        <List.Item key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <div>
                            <b>Trạng thái:</b> <Tag color={order.status === 'completed' ? 'green' : 'blue'}>{order.status}</Tag><br />
                            <b>Tổng tiền:</b> {order.totalprice?.toLocaleString('vi-VN')}đ<br />
                            <b>Phương thức thanh toán:</b> {order.paymentMethod || 'Chưa chọn'}<br />
                            <b>Trạng thái thanh toán:</b> <Tag color={order.paymentStatus === 'success' ? 'green' : 'orange'}>{order.paymentStatus || 'pending'}</Tag>
                          </div>
                          {order.status === 'completed' && order.paymentStatus !== 'success' && (
                            <Button type="primary" loading={paying} onClick={() => handleCashPayment(order._id)}>
                              Xác nhận thanh toán tiền mặt
                            </Button>
                          )}
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ServantDashboard; 