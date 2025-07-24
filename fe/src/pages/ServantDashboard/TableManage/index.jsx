import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Button, Typography, message, Modal, Tag, Input, Select, QRCode, Radio } from 'antd';
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
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [quickCreatePeople, setQuickCreatePeople] = useState(1);
  const [quickCreateNote, setQuickCreateNote] = useState('');
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [showAttachCustomerModal, setShowAttachCustomerModal] = useState(false);
  const [attachEmail, setAttachEmail] = useState('');
  const [attachPhone, setAttachPhone] = useState('');
  const [attachFullname, setAttachFullname] = useState('');
  const [attachingCustomer, setAttachingCustomer] = useState(false);
  const [paymentType, setPaymentType] = useState(null); // 'cash' | 'online'
  const [radioMode, setRadioMode] = useState('payment'); // 'payment' | 'booking'
  const [selectedTables, setSelectedTables] = useState([]); // array of table objects

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
    if (radioMode === 'booking') {
      // Multi-select for booking mode
      if (!table.isOccupied) {
        setSelectedTables(prev => {
          const exists = prev.find(t => t._id === table._id);
          if (exists) {
            return prev.filter(t => t._id !== table._id);
          } else {
            return [...prev, table];
          }
        });
      }
    } else {
      // Single select for payment mode
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

  const handleQuickCreateReservation = async () => {
    if (!selectedTables || selectedTables.length === 0) {
      message.error('Bạn phải chọn ít nhất 1 bàn trống để tạo reservation!');
      return;
    }
    setCreatingReservation(true);
    try {
      const data = {
        bookedTable: selectedTables.map(t => t._id),
        numberOfPeople: quickCreatePeople,
        note: quickCreateNote
      };
      console.log('[DEBUG] Gửi tạo reservation:', data);
      await servantService.quickCreateReservation(data);
      message.success('Tạo reservation thành công!');
      setShowQuickCreateModal(false);
      setQuickCreatePeople(1);
      setQuickCreateNote('');
      setSelectedTables([]);
      fetchTables();
    } catch (err) {
      console.error('[DEBUG] Lỗi tạo reservation:', err);
      message.error(err?.message || err?.response?.data?.message || 'Lỗi khi tạo reservation');
    }
    setCreatingReservation(false);
  };

  const handleShowAttachCustomerModal = (type) => {
    setPaymentType(type);
    setShowAttachCustomerModal(true);
  };

  const handleAttachCustomerAndPay = async () => {
    setAttachingCustomer(true);
    try {
      // Gán customerId
      await servantService.attachCustomerToReservation(currentReservation._id, {
        email: attachEmail,
        phone: attachPhone,
        fullname: attachFullname
      });
      // Cập nhật trạng thái thanh toán
      await servantService.updateReservation(currentReservation._id, {
        paymentStatus: 'success',
        paymentMethod: paymentType,
        status: paymentType === 'cash' ? 'completed' : currentReservation.status
      });
      message.success('Đã cập nhật thanh toán!');
      setShowAttachCustomerModal(false);
      setAttachEmail(''); setAttachPhone(''); setAttachFullname('');
      fetchTables();
      if (paymentType === 'cash') {
        Modal.info({
          title: 'Vui lòng đến quầy để thanh toán',
          content: 'Khách vui lòng đến quầy để hoàn tất thanh toán tiền mặt.',
          okText: 'Đã hiểu'
        });
      } else {
        // Online: chuyển hướng sang trang thanh toán online nếu muốn
        // (Có thể bổ sung logic tạo link PayOS nếu cần)
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi cập nhật khách/thanhtoán');
    }
    setAttachingCustomer(false);
  };

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)' }}>
      <Title level={2} style={{ marginBottom: 16 }}>Quản lý bàn (Servant)</Title>
      <Radio.Group value={radioMode} onChange={e => {
        setRadioMode(e.target.value);
        setSelectedTables([]);
        setSelectedTable(null);
        setCurrentReservation(null);
        setOrders([]);
      }} style={{ marginBottom: 24 }}>
        <Radio.Button value="payment">Thanh toán</Radio.Button>
        <Radio.Button value="booking">Đặt bàn cho khách đến trực tiếp</Radio.Button>
      </Radio.Group>
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
              {filteredTables.map(table => {
                const isSelected = radioMode === 'booking'
                  ? selectedTables.some(t => t._id === table._id)
                  : selectedTable?._id === table._id;
                return (
                  <Card
                    key={table._id}
                    hoverable
                    style={{
                      width: 110,
                      height: 90,
                      background: isSelected ? '#e0e7ff' : '#fff',
                      border: isSelected ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                      boxShadow: isSelected ? '0 2px 8px #6366f122' : 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: table.isOccupied && radioMode === 'booking' ? 'not-allowed' : 'pointer',
                      opacity: table.isOccupied && radioMode === 'booking' ? 0.5 : 1,
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
                );
              })}
            </div>
          </Card>
          {/* Nút tạo reservation cho nhiều bàn khi ở booking mode */}
          {radioMode === 'booking' && selectedTables.length > 0 && (
            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <Button type="primary" size="large" onClick={() => setShowQuickCreateModal(true)}>
                Tạo reservation cho {selectedTables.length} bàn đã chọn
              </Button>
            </div>
          )}
        </Col>
        {/* Thông tin chi tiết bàn */}
        <Col xs={24} md={8} lg={8} xl={8}>
          <Card title={<b>Thông tin bàn</b>} bordered style={{ borderRadius: 12, minHeight: 500 }}>
            {radioMode === 'booking' ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 80 }}>
                {selectedTables.length === 0
                  ? 'Chọn một hoặc nhiều bàn trống để đặt bàn cho khách đến trực tiếp.'
                  : `Đã chọn ${selectedTables.length} bàn: ${selectedTables.map(t => t.tableNumber).join(', ')}`}
              </div>
            ) : !selectedTable ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 80 }}>Chọn một bàn để xem chi tiết</div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Bàn số: {selectedTable.tableNumber}</Text><br />
                  <Text>Sức chứa: {selectedTable.capacity}</Text><br />
                  <Text>Trạng thái: <Tag color={selectedTable.isOccupied ? 'orange' : 'green'}>{selectedTable.isOccupied ? 'Đang sử dụng' : 'Trống'}</Tag></Text>
                </div>
                {/* Nếu bàn trống, cho phép tạo reservation nhanh */}
                {!selectedTable.isOccupied && (
                  <Button type="primary" onClick={() => setShowQuickCreateModal(true)} style={{ marginBottom: 16 }}>
                    Tạo reservation cho khách đến trực tiếp
                  </Button>
                )}
                {/* Nếu có reservation, hiển thị QR code */}
                {currentReservation && (
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Title level={5}>Mã QR đặt món:</Title>
                    <QRCode value={window.location.origin + '/booking-food/table-order?code=' + currentReservation.reservationCode} size={120} />
                    <div style={{ marginTop: 8 }}>
                      <Button size="small" onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/booking-food/table-order?code=' + currentReservation.reservationCode);
                        message.success('Đã sao chép link!');
                      }}>Sao chép link</Button>
                    </div>
                  </div>
                )}
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
                {/* Thanh toán */}
                {currentReservation && (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Thanh toán:</Title>
                    <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleShowAttachCustomerModal('cash')}>Thanh toán tiền mặt</Button>
                    <Button onClick={() => handleShowAttachCustomerModal('online')}>Thanh toán online</Button>
                  </div>
                )}
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

      {/* Modal tạo reservation nhanh */}
      <Modal
        open={showQuickCreateModal}
        title="Tạo reservation cho khách đến trực tiếp"
        onCancel={() => setShowQuickCreateModal(false)}
        onOk={handleQuickCreateReservation}
        confirmLoading={creatingReservation}
        okText="Tạo reservation"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 12 }}>
          <Text>Số người:</Text>
          <Input type="number" min={1} value={quickCreatePeople} onChange={e => setQuickCreatePeople(Number(e.target.value))} style={{ width: 100, marginLeft: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text>Ghi chú:</Text>
          <Input value={quickCreateNote} onChange={e => setQuickCreateNote(e.target.value)} placeholder="Ghi chú (nếu có)" />
        </div>
      </Modal>

      {/* Modal nhập email/sđt khi thanh toán */}
      <Modal
        open={showAttachCustomerModal}
        title={paymentType === 'cash' ? 'Xác nhận thanh toán tiền mặt' : 'Thanh toán online'}
        onCancel={() => setShowAttachCustomerModal(false)}
        onOk={handleAttachCustomerAndPay}
        confirmLoading={attachingCustomer}
        okText={paymentType === 'cash' ? 'Xác nhận đã thanh toán' : 'Tiếp tục thanh toán'}
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 12 }}>
          <Text>Họ tên khách (nếu có):</Text>
          <Input value={attachFullname} onChange={e => setAttachFullname(e.target.value)} placeholder="Họ tên khách" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text>Email:</Text>
          <Input value={attachEmail} onChange={e => setAttachEmail(e.target.value)} placeholder="Email (nếu có)" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text>Số điện thoại:</Text>
          <Input value={attachPhone} onChange={e => setAttachPhone(e.target.value)} placeholder="Số điện thoại (nếu có)" />
        </div>
        <div style={{ color: '#888', fontSize: 13 }}>
          Có thể chỉ cần nhập 1 trong 2: email hoặc số điện thoại.
        </div>
      </Modal>
    </div>
  );
};

export default ServantTableManage; 