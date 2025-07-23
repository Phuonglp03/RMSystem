import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Button, Typography, message, Modal, Tag, Input, Select } from 'antd';
import tableService from '../../../services/table.service';
import servantService from '../../../services/servant.service';

const { Title, Text } = Typography;
const { Option } = Select;

const ServantTableManage = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const tables = await servantService.getAllTablesWithStatus();
      setTables(tables);
    } catch (err) {
      message.error('Không lấy được danh sách bàn');
    }
    setLoading(false);
  };

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setCurrentReservation(table.currentReservationDetail || null);
    try {
      if (table.currentReservationDetail) {
        const res = await tableService.getOrdersByReservationId(table.currentReservationDetail._id);
        setOrders(res || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    }
  };

  // Filter bàn
  const filteredTables = tables.filter(table => {
    if (filter === 'all') return true;
    if (filter === 'available') return !table.isOccupied;
    if (filter === 'occupied') return table.isOccupied;
    return true;
  }).filter(table =>
    search === '' || String(table.tableNumber).includes(search.trim())
  );

  const handleCashPayment = async (orderId) => {
    Modal.confirm({
      title: 'Xác nhận thanh toán tiền mặt',
      content: 'Bạn chắc chắn muốn xác nhận đã thanh toán tiền mặt cho đơn này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setPaying(true);
        try {
          await servantService.confirmCashPayment(orderId);
          message.success('Đã xác nhận thanh toán tiền mặt!');
          fetchTables();
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
        {/* Danh sách bàn (Grid) */}
        <Col xs={24} md={16} lg={16} xl={16} style={{ minHeight: 500 }}>
          <Card
            title={<b>Danh sách bàn</b>}
            bordered
            style={{ borderRadius: 12, minHeight: 500 }}
            loading={loading}
            extra={
              <div style={{ display: 'flex', gap: 12 }}>
                <Select value={filter} onChange={setFilter} style={{ width: 120 }}>
                  <Option value="all">Tất cả</Option>
                  <Option value="available">Còn trống</Option>
                  <Option value="occupied">Đang sử dụng</Option>
                </Select>
                <Input.Search
                  placeholder="Tìm số bàn"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 140 }}
                  allowClear
                />
              </div>
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {filteredTables.map(table => (
                <Card
                  key={table._id}
                  hoverable
                  style={{
                    width: 110,
                    height: 90,
                    background: selectedTable?._id === table._id ? '#e0e7ff' : '#fff',
                    border: selectedTable?._id === table._id ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                    boxShadow: selectedTable?._id === table._id ? '0 2px 8px #6366f122' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleSelectTable(table)}
                  bodyStyle={{ padding: 8, textAlign: 'center' }}
                >
                  <Text strong style={{ fontSize: 18 }}>Bàn {table.tableNumber}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={table.isOccupied ? 'orange' : 'green'}>{table.isOccupied ? 'Đang sử dụng' : 'Trống'}</Tag>
                  </div>
                  {table.currentReservationDetail && <Tag color="blue" style={{ marginTop: 2 }}>Có đặt</Tag>}
                </Card>
              ))}
            </div>
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
                  <Text>Trạng thái: <Tag color={selectedTable.isOccupied ? 'orange' : 'green'}>{selectedTable.isOccupied ? 'Đang sử dụng' : 'Trống'}</Tag></Text>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Reservation hiện tại:</Title>
                  {!currentReservation ? (
                    <Text type="secondary">Không có reservation nào đang phục vụ bàn này.</Text>
                  ) : (
                    <>
                      <div><b>Mã đặt bàn:</b> {currentReservation.reservationCode}</div>
                      <div><b>Khách:</b> {currentReservation.customerId?.fullname || currentReservation.customerId || '---'}</div>
                      <div><b>Thời gian:</b> {new Date(currentReservation.startTime).toLocaleString()} - {new Date(currentReservation.endTime).toLocaleString()}</div>
                      <div><b>Trạng thái:</b> <Tag color="blue">{currentReservation.status}</Tag></div>
                    </>
                  )}
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

export default ServantTableManage; 