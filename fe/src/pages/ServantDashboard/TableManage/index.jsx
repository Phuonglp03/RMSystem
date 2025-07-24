import React, { useEffect, useState } from 'react';
import { Row, Col, Card, List, Button, Typography, message, Modal, Tag, Input, Select, QRCode, Radio, Divider, Table as AntTable } from 'antd';
import tableService from '../../../services/table.service';
import servantService from '../../../services/servant.service';
import userService from '../../../services/user.service';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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
  const [completedOrders, setCompletedOrders] = useState([]);
  const [groupedFoods, setGroupedFoods] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [allOrders, setAllOrders] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [pendingOrdersModal, setPendingOrdersModal] = useState({ open: false, table: null, orders: [] });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [payModal, setPayModal] = useState(false);
  const [customerUserInfo, setCustomerUserInfo] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({ fullname: '', email: '', phone: '' });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  // Khi fetch reservation, fetch luôn voucher của khách
  useEffect(() => {
    if (currentReservation && Array.isArray(currentReservation.customerId) && currentReservation.customerId[0]?.userId) {
      userService.getUserCoupons(currentReservation.customerId[0].userId)
        .then(res => {
          setAvailableVouchers(res.data || res.coupons || res || []);
        })
        .catch(() => setAvailableVouchers([]));
    } else {
      setAvailableVouchers([]);
    }
  }, [currentReservation]);

  // Khi chọn voucher hoặc tableRows thay đổi, tính lại tổng tiền
  useEffect(() => {
    let total = tableRows.reduce((sum, r) => sum + (r.total || 0), 0);
    setFinalTotal(total);
  }, [tableRows]);

  // Khi currentReservation thay đổi, fetch thông tin user nếu cần
  useEffect(() => {
    async function fetchCustomerUser() {
      if (currentReservation && Array.isArray(currentReservation.customerId) && currentReservation.customerId[0]?.userId) {
        try {
          const userRes = await userService.getUserProfile(currentReservation.customerId[0].userId);
          setCustomerUserInfo(userRes.data || userRes.user || userRes);
        } catch {
          setCustomerUserInfo(null);
        }
      } else {
        setCustomerUserInfo(null);
      }
    }
    fetchCustomerUser();
  }, [currentReservation]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const tables = await servantService.getAllTablesWithStatus();
      // Map currentReservationDetail cho mỗi table
      const mappedTables = (tables || []).map(table => {
        let currentReservationDetail = null;
        if (Array.isArray(table.currentReservation) && table.currentReservation.length > 0) {
          currentReservationDetail = table.currentReservation[0];
        } else if (table.currentReservation) {
          currentReservationDetail = table.currentReservation;
        }
        return { ...table, currentReservationDetail };
      });
      setTables(mappedTables);
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
      setSelectedTable(table);
      setCurrentReservation(table.currentReservationDetail || null);
      try {
        if (table.currentReservationDetail) {
          // Lấy tất cả TableOrder theo reservationId
          const allOrdersFetched = await tableService.getOrdersByReservationId(table.currentReservationDetail._id);
          setAllOrders(allOrdersFetched || []);
          // Group completed orders theo tableId
          const completedOrders = (allOrdersFetched || []).filter(o => o.status === 'completed');
          const groupedByTable = {};
          completedOrders.forEach(order => {
            const tid = order.tableId?._id || order.tableId;
            if (!groupedByTable[tid]) groupedByTable[tid] = [];
            groupedByTable[tid].push(order);
          });
          // Tạo data cho bảng
          const rows = Object.entries(groupedByTable).map(([tableId, orders]) => {
            // Gom nhóm món ăn
            const foodMap = {};
            let total = 0;
            let tableNumber = orders[0].tableId?.tableNumber || orders[0].tableId;
            orders.forEach(order => {
              total += order.totalprice || 0;
              (order.foods || []).forEach(f => {
                const key = f.foodId?._id || f.foodId;
                if (!foodMap[key]) {
                  foodMap[key] = {
                    name: f.foodId?.name || '',
                    quantity: 0,
                    price: f.foodId?.price || 0,
                  };
                }
                foodMap[key].quantity += f.quantity;
              });
              (order.combos || []).forEach(c => {
                const key = c._id || c;
                if (!foodMap[key]) {
                  foodMap[key] = {
                    name: 'Combo',
                    quantity: 0,
                    price: c.price || 0,
                  };
                }
                foodMap[key].quantity += 1;
              });
            });
            return {
              tableId,
              tableNumber,
              foods: Object.values(foodMap),
              total,
            };
          });
          setTableRows(rows);
          // Đơn chưa hoàn thành sẽ xử lý khi click vào bàn (modal)
        } else {
          setAllOrders([]);
          setTableRows([]);
        }
      } catch (err) {
        setAllOrders([]);
        setTableRows([]);
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

  // Đặt qrLink trước phần render QR code, mã hóa reservationCode bằng base64
  const qrLink = currentReservation ? (window.location.origin + '/booking-food/table-order?code=' + btoa(currentReservation.reservationCode)) : '';

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

                {/* Nếu có reservation, hiển thị QR code */}
                {currentReservation && (
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Title level={5}>Mã QR đặt món:</Title>
                    <div style={{ display: 'inline-block', cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
                      <QRCode value={qrLink} size={120} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Button size="small" onClick={() => {
                        navigator.clipboard.writeText(qrLink);
                        message.success('Đã sao chép link!');
                      }}>Sao chép link</Button>
                    </div>
                    <Modal
                      open={showQrModal}
                      onCancel={() => setShowQrModal(false)}
                      footer={null}
                      centered
                    >
                      <div style={{ textAlign: 'center', padding: 24 }}>
                        <QRCode value={qrLink} size={320} />
                        <div style={{ marginTop: 16, fontWeight: 600, display: 'block' }}>Quét mã để đặt món</div>
                      </div>
                    </Modal>
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Reservation hiện tại:</Title>
                  {!currentReservation || !Array.isArray(currentReservation.customerId) || !currentReservation.customerId[0]?.userId ? (
                    <Text type="secondary">Không có reservation nào đang phục vụ bàn này.</Text>
                  ) : (
                    (() => {
                      const user = currentReservation.customerId[0].userId;
                      return <>
                        <div><b>Mã đặt bàn:</b> {currentReservation.reservationCode}</div>
                        <div><b>Khách:</b> {user?.fullname || '---'}</div>
                        <div><b>Email:</b> {user?.email || '---'}</div>
                        <div><b>Số điện thoại:</b> {user?.phone || '---'}</div>
                        <div><b>Thời gian:</b> {new Date(currentReservation.startTime).toLocaleString()} - {new Date(currentReservation.endTime).toLocaleString()}</div>
                        <div><b>Trạng thái:</b> <Tag color="blue">{currentReservation.status}</Tag></div>
                      </>;
                    })()
                  )}
                </div>
                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <Button onClick={() => {
                    const user = currentReservation?.customerId?.[0]?.userId;
                    setShowCustomerModal(true);
                    setCustomerForm({
                      fullname: user?.fullname || '',
                      email: user?.email || '',
                      phone: user?.phone || ''
                    });
                  }}>
                    Điền thông tin khách hàng
                  </Button>
                </div>
                <Modal
                  open={showCustomerModal}
                  title="Điền thông tin khách hàng"
                  onCancel={() => setShowCustomerModal(false)}
                  onOk={async () => {
                    if (!currentReservation) return;
                    setSavingCustomer(true);
                    try {
                      const user = currentReservation?.customerId?.[0]?.userId;
                      const dataToSend = {};
                      if (!user?.fullname && customerForm.fullname) dataToSend.fullname = customerForm.fullname;
                      if (!user?.email && customerForm.email) dataToSend.email = customerForm.email;
                      if (!user?.phone && customerForm.phone) dataToSend.phone = customerForm.phone;
                      await servantService.attachCustomerToReservation(currentReservation._id, dataToSend);
                      message.success('Đã lưu thông tin khách hàng!');
                      setShowCustomerModal(false);
                      fetchTables();
                    } catch (err) {
                      message.error('Lỗi khi lưu thông tin khách hàng');
                    }
                    setSavingCustomer(false);
                  }}
                  okText="Lưu thông tin"
                  confirmLoading={savingCustomer}
                >
                  {(() => {
                    const user = currentReservation?.customerId?.[0]?.userId;
                    return <>
                      <div style={{ marginBottom: 12 }}>
                        <Text>Họ tên:</Text>
                        <Input value={customerForm.fullname} onChange={e => setCustomerForm(f => ({ ...f, fullname: e.target.value }))} placeholder="Nhập họ tên" disabled={!!user?.fullname} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text>Email:</Text>
                        <Input value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} placeholder="Nhập email" disabled={!!user?.email} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text>Số điện thoại:</Text>
                        <Input value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} placeholder="Nhập số điện thoại" disabled={!!user?.phone} />
                      </div>
                      <div style={{ color: '#888', fontSize: 13 }}>
                        Nếu email/số điện thoại chưa có tài khoản, hệ thống sẽ tự động tạo tài khoản với mật khẩu mặc định là 123456.
                      </div>
                    </>;
                  })()}
                </Modal>
                {/* Thanh toán */}

                {/* Hiển thị bảng các bàn và món đã hoàn thành */}
                {radioMode === 'payment' && tableRows.length > 0 && (
                  <>
                    <Title level={5}>Danh sách món đã hoàn thành:</Title>
                    <AntTable
                      dataSource={tableRows}
                      rowKey={r => r.tableId}
                      pagination={false}
                      style={{ marginBottom: 24, marginTop: 16 }}
                      columns={[
                        { title: 'Bàn', dataIndex: 'tableNumber', key: 'tableNumber', align: 'center' },
                        {
                          title: 'Món ăn', dataIndex: 'foods', key: 'foods', render: foods => (
                            <div>
                              {foods.map(f => (
                                <div key={f.name + f.price}>
                                  {f.name}: x{f.quantity} <span style={{ color: '#888' }}>({(f.price * f.quantity).toLocaleString('vi-VN')}đ)</span>
                                </div>
                              ))}
                            </div>
                          )
                        },
                        { title: 'Tổng đơn', dataIndex: 'total', key: 'total', align: 'right', render: t => <b>{t.toLocaleString('vi-VN')}đ</b> }
                      ]}
                      onRow={record => ({
                        onClick: () => {
                          // Khi click vào bàn, show modal đơn chưa hoàn thành
                          const pending = (allOrders || []).filter(o => {
                            const tid = o.tableId?._id || o.tableId;
                            return tid === record.tableId && o.status !== 'completed';
                          }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                          setPendingOrdersModal({ open: true, table: record, orders: pending });
                        }
                      })}
                    />
                    <Divider />
                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 24 }}>
                      Tổng cộng: <span style={{ color: '#ff4d4f' }}>{finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                      <Button type="primary" size="large" style={{ fontWeight: 600 }} onClick={() => setPayModal(true)}>Thanh toán tiền mặt</Button>
                      <Button type="default" size="large" style={{ fontWeight: 600 }} onClick={async () => {
                        if (!currentReservation) return;
                        try {
                          const res = await tableService.createPayosReservationPayment(currentReservation.reservationCode);
                          if (res && res.data && res.data.paymentUrl) {
                            window.open(res.data.paymentUrl, '_blank');
                          } else {
                            message.error('Không lấy được link thanh toán');
                          }
                        } catch (err) {
                          message.error('Lỗi khi tạo thanh toán online');
                        }
                      }}>Thanh toán chuyển khoản</Button>
                    </div>
                    <Modal
                      open={payModal}
                      title={<span><ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />Xác nhận thanh toán tiền mặt</span>}
                      onCancel={() => setPayModal(false)}
                      onOk={async () => {
                        if (!currentReservation) return;
                        try {
                          await tableService.updateReservationStatus(currentReservation.reservationCode, {
                            status: 'completed',
                            paymentStatus: 'success',
                            paymentMethod: 'cash',
                            totalAmount: finalTotal,
                            paidAt: new Date(),
                            reservation_payment_id: currentReservation.reservationCode + '-' + Date.now()
                          });
                          message.success('Đã xác nhận thanh toán!');
                          setPayModal(false);
                          fetchTables();
                        } catch (err) {
                          message.error('Lỗi khi xác nhận thanh toán');
                        }
                      }}
                      okText="Xác nhận đã thanh toán"
                      cancelText="Hủy"
                    >
                      <div>Bạn chắc chắn muốn xác nhận đã thanh toán tiền mặt cho đơn này?</div>
                      <div style={{ marginTop: 12, fontWeight: 600 }}>
                        Tổng tiền cần thanh toán: <span style={{ color: '#ff4d4f' }}>{finalTotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </Modal>

                    {/* Danh sách món đang phục vụ */}
                    <div style={{ marginTop: 32 }}>
                      <Title level={5}>Đơn đang chờ phục vụ:</Title>
                      {allOrders.filter(o => o.status !== 'completed').length === 0 ? (
                        <Text type="secondary">Chưa có đơn nào cho bàn này.</Text>
                      ) : (
                        <Button onClick={() => setPendingOrdersModal({ open: true, table: null, orders: allOrders.filter(o => o.status !== 'completed').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) })}>
                          Xem các đơn đang phục vụ
                        </Button>
                      )}
                    </div>
                  </>
                )}

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
      {/* Modal hiển thị đơn chưa hoàn thành của bàn */}
      <Modal
        open={pendingOrdersModal.open}
        title={`Đơn chưa hoàn thành của bàn ${pendingOrdersModal.table?.tableNumber || ''}`}
        onCancel={() => setPendingOrdersModal({ open: false, table: null, orders: [] })}
        footer={null}
        width={600}
      >
        {pendingOrdersModal.orders.length === 0 ? (
          <Text type="secondary">Không có đơn nào chưa hoàn thành.</Text>
        ) : (
          <List
            dataSource={pendingOrdersModal.orders}
            renderItem={(order, idx) => (
              <List.Item key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <b>Đơn số {idx + 1}:</b><br />
                  {(order.foods || []).map(f => (
                    <div key={f.foodId?._id || f.foodId}>{f.foodId?.name || ''}: x{f.quantity}</div>
                  ))}
                  {(order.combos || []).map((c, i) => (
                    <div key={c._id || c}>Combo: x1</div>
                  ))}
                  <div><b>Trạng thái:</b> <Tag color={order.status === 'completed' ? 'green' : 'blue'}>{order.status}</Tag></div>
                  <div><b>Thời gian tạo:</b> {new Date(order.createdAt).toLocaleString()}</div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default ServantTableManage; 