import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Row, 
  Col, 
  Card, 
  List, 
  Tabs, 
  Select, 
  InputNumber, 
  message, 
  Spin,
  Typography,
  Divider,
  Badge,
  Space,
  Tag,
  Tooltip,
  Table as AntTable
} from 'antd';
import { 
  ShoppingCartOutlined, 
  TableOutlined, 
  CheckCircleOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import tableService from '../../services/table.service';
import { foodService } from '../../services/food.service';
import comboService from '../../services/combo.service';
import axios from 'axios'; // Added axios import

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const TableOrderTest = () => {
  // State for code entry popup
  const [codeModalVisible, setCodeModalVisible] = useState(true);
  const [reservationCode, setReservationCode] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // State for main content
  const [reservation, setReservation] = useState(null);
  const [foodCategories, setFoodCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null, type: null });
  const [placedOrders, setPlacedOrders] = useState({});
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showPlacedOrdersModal, setShowPlacedOrdersModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Khi trang mount, nếu có code trên URL, tự động check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // Nếu có code trên URL, decode base64
    let decodedCode = code;
    try {
      if (code) decodedCode = atob(code);
    } catch (e) {
      decodedCode = code; // Nếu decode lỗi, dùng nguyên
    }
    if (decodedCode) {
      setReservationCode(decodedCode);
      setTimeout(() => handleCheckCode(decodedCode), 0);
    }
  }, []);

  // Sửa handleCheckCode để nhận code truyền vào (hoặc lấy từ state)
  const handleCheckCode = async (inputCode) => {
    const codeToCheck = inputCode || reservationCode;
    if (!codeToCheck.trim()) {
      setCodeError('Vui lòng nhập mã đặt bàn');
      return;
    }

    setCheckingCode(true);
    setCodeError('');
    
    try {
      const [res, categoryRes, foodRes, comboRes] = await Promise.all([
        tableService.getReservationByCode(codeToCheck),
        foodService.getAllFoodCategories(),
        foodService.getAllFoods(),
        comboService.getAllCombos(),
      ]);
      setReservation(res.data || res);
      setFoodCategories(categoryRes.data || categoryRes.categories || categoryRes || []);
      setFoods(foodRes.data || foodRes.foods || foodRes || []);
      setCombos(comboRes.data || comboRes.combos || comboRes || []);
      if ((categoryRes.data || categoryRes.categories || categoryRes)?.length > 0) {
        setSelectedCategory((categoryRes.data || categoryRes.categories || categoryRes)[0]._id);
      }
      if ((res.data || res)?._id) {
        const ordersRes = await tableService.getOrdersByReservationId((res.data || res)._id);
        setOrders(ordersRes || []);
      } else {
        setOrders([]);
      }
      setCodeModalVisible(false);
      message.success('Mã đặt bàn hợp lệ!');
    } catch (err) {
      setCodeError(err.response?.data?.message || err.message || 'Mã đặt bàn không hợp lệ');
    }
    setCheckingCode(false);
  };

  // Add item to cart
  const addToCart = (item, type) => {
    if (!selectedTable) {
      return;
    }
    
    const tableId = selectedTable._id;
    const currentCart = cart[tableId] || [];
    const existingItem = currentCart.find(cartItem => 
      cartItem.id === item._id && cartItem.type === type
    );

    if (existingItem) {
      setCart({
        ...cart,
        [tableId]: currentCart.map(cartItem => 
          cartItem.id === item._id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      });
    } else {
      setCart({
        ...cart,
        [tableId]: [
          ...currentCart,
          {
            id: item._id,
            name: item.name,
            price: item.price,
            type: type,
            quantity: 1,
            image: item.images?.[0] || item.image
          }
        ]
      });
    }
    message.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId, type, newQuantity) => {
    const tableId = selectedTable._id;
    const currentCart = cart[tableId] || [];

    if (newQuantity <= 0) {
      setCart({
        ...cart,
        [tableId]: currentCart.filter(item => !(item.id === itemId && item.type === type))
      });
    } else {
      setCart({
        ...cart,
        [tableId]: currentCart.map(item => 
          item.id === itemId && item.type === type
            ? { ...item, quantity: newQuantity }
            : item
        )
      });
    }
  };

  // Calculate cart total
  const calculateTotal = (tableId) => {
    const currentCart = cart[tableId] || [];
    return currentCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  //'https://rm-system-4tru.vercel.app'
  // Hàm fetch lại danh sách đơn đã đặt theo reservationId
  const fetchPlacedOrders = async (reservationId) => {
    try {
      const res = await axios.get(`https://rm-system-4tru.vercel.app/api/table-orders/reservation/${reservationId}`);
      const orders = res.data.data;
      console.log('[DEBUG] Orders từ API:', orders); // Log dữ liệu trả về từ API
      // Gom nhóm theo tableId (key là string)
      const grouped = {};
      orders.forEach(order => {
        const tableId = typeof order.tableId === 'object' ? order.tableId._id : order.tableId;
        if (!grouped[tableId]) grouped[tableId] = [];
        grouped[tableId].push(order);
      });
      setPlacedOrders(grouped);
      console.log('[DEBUG] placedOrders sau khi set:', grouped); // Log state mới
    } catch (err) {
      message.error('Không lấy được danh sách đơn đã đặt');
      console.error('[DEBUG] Lỗi khi fetchPlacedOrders:', err);
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (Object.keys(cart).length === 0) {
      message.error('Vui lòng thêm món vào giỏ hàng trước khi đặt');
      return;
    }

    const ordersForAPI = Object.entries(cart).map(([tableId, items]) => ({
      tableId,
      reservationId: reservation?._id,
      foods: items.filter(item => item.type === 'food').map(item => ({ foodId: item.id, quantity: item.quantity })),
      combos: items.filter(item => item.type === 'combo').map(item => item.id),
      status: 'pending' // Gửi trạng thái mặc định
    }));

    setSubmitting(true);
    try {
      const orderData = {
        bookingCode: reservationCode,
        orders: ordersForAPI
      };

      const response = await axios.post('https://rm-system-4tru.vercel.app/api/table-orders', orderData);
      const returnedOrders = response.data.data;

      // Cập nhật placedOrders để luôn giữ lại đơn cũ và thêm đơn mới
      setPlacedOrders(prev => {
        const newPlaced = { ...prev };
        returnedOrders.forEach(dbOrder => {
          const tableId = dbOrder.tableId;
          if (!newPlaced[tableId]) newPlaced[tableId] = [];
          // Tìm xem đã có đơn này chưa
          const exists = newPlaced[tableId].some(order => order._id === dbOrder._id);
          if (!exists) {
            // Lấy lại items từ cart cho đơn mới
            const cartForThisTable = cart[tableId] || [];
            newPlaced[tableId].push({
              _id: dbOrder._id,
              status: dbOrder.status,
              items: cartForThisTable,
              createdAt: new Date(),
              totalprice: dbOrder.totalprice
            });
          }
        });
        return newPlaced;
      });

      message.success('Đặt món thành công!');
      setCart({}); // Reset giỏ hàng
      // Gọi lại API lấy danh sách đơn đã đặt để luôn hiển thị đơn mới nhất
      if (reservation?._id) {
        await new Promise(r => setTimeout(r, 300)); // Chờ backend lưu xong
        await fetchPlacedOrders(reservation._id);
      }

    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt món');
      console.error('[DEBUG] Lỗi khi đặt món:', err);
    }
    setSubmitting(false);
  };

  // Filter foods by selected category
  const filteredFoods = selectedCategory 
    ? foods.filter(food => String(food.categoryId?._id || food.categoryId) === String(selectedCategory))
    : foods;

  // Open detail modal
  const openDetailModal = (item, type) => {
    setDetailModal({ open: true, data: item, type });
  };

  // Handle payment with PayOS
  const handlePayWithPayos = async (orderId) => {
    try {
      const res = await tableService.createPayosPayment(orderId);
      if (res && res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        console.log('No paymentUrl in response:', res);
      }
    } catch (err) {
      console.error('Error creating PayOS payment:', err);
    }
  };

  // Xem đơn đã gọi
  const handleShowPlacedOrders = async () => {
    if (reservation?._id) {
      await fetchPlacedOrders(reservation._id);
    }
    setShowPlacedOrdersModal(true);
  };

  // Mở modal thanh toán
  const handleShowPaymentModal = async () => {
    // Lấy lại danh sách orders mới nhất
    if (reservation?._id) {
      const ordersRes = await tableService.getOrdersByReservationId(reservation._id);
      // Lọc các order status = completed
      const completed = (ordersRes || []).filter(o => o.status === 'completed');
      setCompletedOrders(completed);
      setTotalCompleted(completed.reduce((sum, o) => sum + (o.totalprice || 0), 0));
    }
    setShowPaymentModal(true);
  };

  // Thanh toán online
  const handlePayOnline = async () => {
    setPaying(true);
    try {
      const res = await tableService.createPayosReservationPayment(reservation.reservationCode);
      if (res && res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        message.error('Không lấy được link thanh toán');
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi tạo thanh toán online');
    }
    setPaying(false);
  };

  // Helper: gom, sort đơn đã gọi
  const getSortedPlacedOrders = () => {
    // Gom tất cả đơn từ các bàn thành 1 mảng
    let allOrders = [];
    Object.entries(placedOrders).forEach(([tableId, orders]) => {
      orders.forEach(order => {
        allOrders.push({ ...order, tableId });
      });
    });
    // Sort: trạng thái (pending lên đầu, completed xuống dưới), rồi theo createdAt tăng dần
    allOrders.sort((a, b) => {
      if (a.status === b.status) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });
    return allOrders;
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f4f6fb 100%)' }}>
      {/* Code Entry Modal */}
      <Modal
        title="Nhập mã đặt bàn"
        open={codeModalVisible}
        onOk={() => handleCheckCode()}
        onCancel={() => setCodeModalVisible(false)}
        confirmLoading={checkingCode}
        okText="Xác nhận"
        cancelText="Hủy"
        closable={false}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>Vui lòng nhập mã đặt bàn của bạn</Title>
          <Input
            size="large"
            placeholder="Nhập mã đặt bàn..."
            value={reservationCode}
            onChange={(e) => setReservationCode(e.target.value)}
            onPressEnter={e => handleCheckCode(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          {codeError && (
            <Text type="danger" style={{ display: 'block', marginTop: '10px' }}>
              {codeError}
            </Text>
          )}
        </div>
      </Modal>

      {/* Main Content */}
      {!codeModalVisible && reservation && (
        <div>
          {/* Header */}
          <div style={{ background: 'rgba(255,255,255,0.98)', padding: '28px 32px', borderRadius: '14px', marginBottom: '28px', boxShadow: '0 4px 24px rgba(80,120,255,0.10)', border: '1.5px solid #e0e7ff', transition: 'box-shadow 0.3s' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={3} style={{ margin: 0, fontWeight: 700, fontSize: 28, color: '#1a2341', letterSpacing: 1 }}>
                  Đặt món cho bàn
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Khách hàng: {
                    reservation.customerId?.fullname ||
                    (Array.isArray(reservation.customerId) && reservation.customerId[0]?.fullname) ||
                    reservation.customerId?.name ||
                    "Khách lẻ"
                  }
                </Text>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size="large"
                  style={{ borderRadius: 8, fontWeight: 600, background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)'}
                  onClick={() => setCodeModalVisible(true)}
                >
                  Đổi mã đặt bàn
                </Button>
              </Col>
            </Row>
          </div>

          {/* Main Layout */}
          <Row gutter={28}>
            {/* Left Column - Food Categories & Tables */}
            <Col xs={24} md={6}>
              <Card title={<span style={{ fontWeight: 600, fontSize: 18 }}>Danh mục món ăn</span>} style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', marginBottom: 24, border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}>
                <List
                  dataSource={foodCategories}
                  renderItem={(category) => (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        background: selectedCategory === category._id ? 'linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)' : 'transparent',
                        marginBottom: '8px',
                        fontWeight: selectedCategory === category._id ? 700 : 500,
                        color: selectedCategory === category._id ? '#6366f1' : '#1a2341',
                        border: selectedCategory === category._id ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                        boxShadow: selectedCategory === category._id ? '0 2px 12px #6366f122' : 'none',
                        transition: 'all 0.25s',
                      }}
                      onClick={() => setSelectedCategory(category._id)}
                    >
                      <Text strong={selectedCategory === category._id} style={{ fontSize: 16 }}>
                        {category.title}
                      </Text>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Tables Selection */}
              <Card title={<span style={{ fontWeight: 600, fontSize: 18 }}>Bàn & Món đã đặt</span>} style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', marginBottom: 24, border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}>
                <List
                  dataSource={reservation.bookedTable}
                  renderItem={(table) => {
                    // Đảm bảo luôn là mảng để tránh lỗi runtime
                    const ordersForThisTable = Array.isArray(placedOrders[table._id]) ? placedOrders[table._id] : [];
                    return (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          padding: '16px 18px',
                          borderRadius: '8px',
                          background: selectedTable?._id === table._id ? 'linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)' : 'transparent',
                          border: selectedTable?._id === table._id ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                          marginBottom: '10px',
                          fontWeight: selectedTable?._id === table._id ? 700 : 500,
                          color: selectedTable?._id === table._id ? '#6366f1' : '#1a2341',
                          boxShadow: selectedTable?._id === table._id ? '0 4px 16px #6366f122' : 'none',
                          transition: 'all 0.25s',
                          display: 'block'
                        }}
                        onClick={() => setSelectedTable(table)}
                      >
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: 16 }}>Bàn {table.tableNumber}</Text>
                            {selectedTable?._id === table._id && (
                              <CheckCircleOutlined style={{ color: '#10b981', fontSize: 22, filter: 'drop-shadow(0 2px 6px #10b98144)' }} />
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: 15 }}>Sức chứa: {table.capacity} người</Text>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>

            {/* Middle Column - Foods and Combos */}
            <Col xs={24} md={12}>
              <Tabs defaultActiveKey="foods" style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: 16, border: '1.5px solid #e0e7ff' }}>
                <TabPane tab={<span style={{ fontWeight: 600, fontSize: 17, color: '#6366f1' }}>Món ăn</span>} key="foods">
                  <Row gutter={[20, 20]}>
                    {filteredFoods.length === 0 ? (
                      <Col span={24} style={{ textAlign: 'center', padding: 60, color: '#b0b3bb', fontSize: 18 }}>
                        <Text type="secondary">Không có món ăn nào trong danh mục này.</Text>
                      </Col>
                    ) : (
                      filteredFoods.map(food => (
                        <Col xs={24} sm={12} key={food._id}>
                          <Card
                            hoverable
                            style={{
                              borderRadius: 16,
                              boxShadow: '0 2px 16px rgba(99,102,241,0.10)',
                              border: '2px solid #e0e7ff',
                              transition: 'box-shadow 0.3s, border 0.3s',
                              minHeight: 340,
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            }}
                            bodyStyle={{ padding: 18, paddingBottom: 8 }}
                            cover={
                              <img
                                alt={food.name}
                                src={food.images?.[0]}
                                style={{
                                  height: 170,
                                  objectFit: 'cover',
                                  borderTopLeftRadius: 16,
                                  borderTopRightRadius: 16,
                                  transition: 'filter 0.2s',
                                  cursor: 'pointer'
                                }}
                                onMouseOver={e => e.currentTarget.style.filter = 'brightness10.92)'}
                                onMouseOut={e => e.currentTarget.style.filter = 'none'}
                                onClick={() => openDetailModal(food, 'food')}
                              />
                            }
                            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 32px #6366f144'; e.currentTarget.style.border = '2px solid #6366f1'; }}
                            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(99,102,241,0.10)'; e.currentTarget.style.border = '2px solid #e0e7ff'; }}
                            actions={[
                              <Tooltip title={!selectedTable ? 'Vui lòng chọn bàn trước' : ''}>
                                <Button
                                  type="primary"
                                  size="large"
                                  style={{
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    width: '90%',
                                    background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px #6366f133',
                                    transition: 'background 0.2s',
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)'}
                                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)'}
                                  onClick={() => addToCart(food, 'food')}
                                  disabled={!selectedTable}
                                >
                                  <PlusOutlined /> Thêm
                                </Button>
                              </Tooltip>
                            ]}
                          >
                            <Card.Meta
                              title={<span style={{ fontWeight: 700, fontSize: 18, color: '#6366f1', cursor: 'pointer' }} onClick={() => openDetailModal(food, 'food')}>{food.name}</span>}
                              description={
                                <div>
                                  <Text type="secondary" style={{ fontSize: 15 }}>{food.description}</Text>
                                  <br />
                                  <Text strong style={{ color: '#ff4d4f', fontSize: 17 }}>
                                    {food.price?.toLocaleString('vi-VN')}đ
                                  </Text>
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
                <TabPane tab={<span style={{ fontWeight: 600, fontSize: 17, color: '#10b981' }}>Combo</span>} key="combos">
                  <Row gutter={[20, 20]}>
                    {combos.map(combo => (
                      <Col xs={24} sm={12} key={combo._id}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 16px rgba(16,185,129,0.10)',
                            border: '2px solid #e0e7ff',
                            transition: 'box-shadow 0.3s, border 0.3s',
                            minHeight: 340,
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                          }}
                          bodyStyle={{ padding: 18, paddingBottom: 8 }}
                          cover={
                            <img
                              alt={combo.name}
                              src={combo.image}
                              style={{
                                height: 170,
                                objectFit: 'cover',
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                transition: 'filter 0.2s',
                                cursor: 'pointer'
                              }}
                              onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.92)'}
                              onMouseOut={e => e.currentTarget.style.filter = 'none'}
                              onClick={() => openDetailModal(combo, 'combo')}
                            />
                          }
                          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 32px #10b98144'; e.currentTarget.style.border = '2px solid #10b981'; }}
                          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(16,185,129,0.10)'; e.currentTarget.style.border = '2px solid #e0e7ff'; }}
                          actions={[
                            <Tooltip title={!selectedTable ? 'Vui lòng chọn bàn trước' : ''}>
                              <Button
                                type="primary"
                                size="large"
                                style={{
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  width: '90%',
                                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                  border: 'none',
                                  boxShadow: '0 2px 8px #10b98133',
                                  transition: 'background 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #34d399 0%, #10b981 100%)'}
                                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'}
                                onClick={() => addToCart(combo, 'combo')}
                                disabled={!selectedTable}
                              >
                                <PlusOutlined /> Thêm
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <Card.Meta
                            title={<span style={{ fontWeight: 700, fontSize: 18, color: '#10b981', cursor: 'pointer' }} onClick={() => openDetailModal(combo, 'combo')}>{combo.name}</span>}
                            description={
                              <div>
                                <Text type="secondary" style={{ fontSize: 15 }}>{combo.description}</Text>
                                <br />
                                <Text strong style={{ color: '#ff4d4f',

 fontSize: 17 }}>
                                  {combo.price?.toLocaleString('vi-VN')}đ
                                </Text>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </TabPane>
              </Tabs>
            </Col>

            {/* Right Column - Cart */}
            <Col xs={24} md={6}>
              {/* Cart */}
              <Card 
                title={
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#6366f1' }}>
                    {selectedTable ? `Giỏ hàng - Bàn ${selectedTable.tableNumber}` : 'Giỏ hàng (Vui lòng chọn bàn)'}
                    <Badge count={selectedTable ? (cart[selectedTable._id] || []).length : 0} style={{ marginLeft: '8px', background: '#10b981' }} />
                  </span>
                }
                style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}
              >
                {(cart[selectedTable?._id] || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                    <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div>
                    {(cart[selectedTable._id] || []).map((item, index) => (
                      <div key={index} style={{ marginBottom: '14px', padding: '12px', border: '1.5px solid #e0e7ff', borderRadius: '8px', background: '#f8fafc', boxShadow: '0 1px 4px #6366f111' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                          <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                          <Tag color={item.type === 'food' ? 'geekblue' : 'green'} style={{ fontSize: 13, borderRadius: 6, background: item.type === 'food' ? 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)' : 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', color: '#fff', border: 'none', fontWeight: 600 }}>
                            {item.type === 'food' ? 'Món ăn' : 'Combo'}
                          </Tag>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 15 }}>{item.price?.toLocaleString('vi-VN')}đ</Text>
                          <Space>
                            <Button 
                              size="small" 
                              icon={<MinusOutlined />}
                              style={{ borderRadius: 6, background: '#e0e7ff', color: '#6366f1', border: 'none', fontWeight: 700 }}
                              onClick={() => updateCartQuantity(item.id, item.type, item.quantity - 1)}
                            />
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{item.quantity}</span>
                            <Button 
                              size="small" 
                              icon={<PlusOutlined />}
                              style={{ borderRadius: 6, background: '#e0e7ff', color: '#10b981', border: 'none', fontWeight: 700 }}
                              onClick={() => updateCartQuantity(item.id, item.type, item.quantity + 1)}
                            />
                          </Space>
                        </div>
                      </div>
                    ))}
                    
                    <Divider />
                    
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                          {calculateTotal(selectedTable._id).toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: 17, background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)'}
                      onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)'}
                      loading={submitting}
                      disabled={
                        !selectedTable ||
                        !cart[selectedTable._id] ||
                        cart[selectedTable._id].length === 0
                      }
                      onClick={handleSubmitOrder}
                    >
                      {submitting ? 'Đang đặt món...' : 'Xác nhận đặt món'}
                    </Button>
                  </div>
                )}
              </Card>
              <Card style={{ marginTop: 40, boxShadow: '0 2px 12px #6366f122', borderRadius: 14 }}>
                <Button
                  type="default"
                  block
                  style={{ marginBottom: 12, fontWeight: 600 }}
                  onClick={handleShowPlacedOrders}
                >
                  Xem đơn đã gọi
                </Button>
                <Button
                  type="primary"
                  block
                  style={{ fontWeight: 600, background: '#10b981', border: 'none', borderRadius: 8, boxShadow: '0 2px 8px #10b98133', marginBottom: 8 }}
                  onClick={handleShowPaymentModal}
                >
                  Thanh toán
                </Button>
              </Card>
            </Col>
          </Row>
          
        </div>
      )}
      {/* Modal xem đơn đã gọi */}
      <Modal
        open={showPlacedOrdersModal}
        title="Đơn đã gọi"
        onCancel={() => setShowPlacedOrdersModal(false)}
        footer={null}
        width={700}
      >
        {getSortedPlacedOrders().length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Chưa có đơn nào.</div>
        ) : (
          getSortedPlacedOrders().map((order, idx) => (
            <div key={order._id || idx} style={{
              marginBottom: 18,
              background: order.status === 'pending' ? '#f0fdfa' : '#f8fafc',
              border: order.status === 'pending' ? '2px solid #10b981' : '1.5px solid #e0e7ff',
              borderRadius: 10,
              padding: 16,
              boxShadow: order.status === 'pending' ? '0 2px 8px #10b98122' : '0 1px 4px #6366f111',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b>Bàn: {reservation.bookedTable.find(t => t._id === order.tableId)?.tableNumber || order.tableId}</b>
                <span style={{ fontWeight: 500 }}>Đơn số: {idx + 1}</span>
                <span style={{ color: order.status === 'pending' ? '#10b981' : '#6366f1', fontWeight: 600 }}>{order.status}</span>
              </div>
              <ul style={{ marginTop: 8, marginBottom: 8 }}>
                {(order.foods || []).map(f => (
                  <li key={f.foodId?._id || f.foodId}>
                    {f.foodId?.name || ''} x {f.quantity} ({f.foodId?.price?.toLocaleString('vi-VN')}đ)
                  </li>
                ))}
                {(order.combos || []).map(c => (
                  <li key={c._id}>
                    Combo: {c.comboId} x {c.quantity}
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'right', fontWeight: 600 }}>
                Tổng đơn: {order.totalprice?.toLocaleString('vi-VN')}đ
              </div>
            </div>
          ))
        )}
      </Modal>

      {/* Modal thanh toán */}
      <Modal
        open={showPaymentModal}
        title="Thanh toán các món đã hoàn thành"
        onCancel={() => setShowPaymentModal(false)}
        footer={null}
        width={800}
      >
        {completedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Chưa có món nào hoàn thành để thanh toán.</div>
        ) : (
          <>
            <AntTable
              dataSource={completedOrders.map((order, idx) => ({
                key: order._id || idx,
                table: order.tableId?.tableNumber || '',
                orderIndex: idx + 1,
                foods: order.foods,
                combos: order.combos,
                total: order.totalprice,
              }))}
              pagination={false}
              bordered
              style={{ marginBottom: 24 }}
              columns={[
                { title: 'Bàn', dataIndex: 'table', key: 'table', align: 'center' },
                { title: 'Đơn số', dataIndex: 'orderIndex', key: 'orderIndex', align: 'center' },
                {
                  title: 'Món ăn',
                  dataIndex: 'foods',
                  key: 'foods',
                  render: (foods, record) => (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {(foods || []).map(f => (
                        <li key={f.foodId?._id || f.foodId}>
                          {f.foodId?.name || ''} x {f.quantity} ({f.foodId?.price?.toLocaleString('vi-VN')}đ)
                        </li>
                      ))}
                      {(record.combos || []).map(c => (
                        <li key={c._id}>
                          Combo: {c.comboId} x {c.quantity}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Tổng đơn',
                  dataIndex: 'total',
                  key: 'total',
                  align: 'right',
                  render: (total) => <b>{total?.toLocaleString('vi-VN')}đ</b>,
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: 18, marginRight: 16 }}>Tổng cộng:</span>
              <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: 22 }}>{totalCompleted.toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end', gap: 24 }}>
              <Button type="default" size="large" style={{ fontWeight: 600, borderRadius: 8, background: '#f3f4f6', color: '#6366f1', border: '1.5px solid #e0e7ff' }} onClick={() => message.info('Chức năng đang phát triển')}>Thanh toán tiền mặt</Button>
              <Button type="primary" size="large" style={{ fontWeight: 700, borderRadius: 8, background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', letterSpacing: 1 }} loading={paying} onClick={handlePayOnline}>Thanh toán online</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailModal.open}
        title={detailModal.type === 'food' ? 'Chi tiết món ăn' : 'Chi tiết combo'}
        onCancel={() => setDetailModal({ open: false, data: null, type: null })}
        footer={null}
        width={480}
        centered
      >
        {detailModal.data && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={detailModal.data.images?.[0] || detailModal.data.image}
              alt={detailModal.data.name}
              style={{ width: 220, height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 18, boxShadow: '0 2px 12px #6366f122' }}
            />
            <Title level={4} style={{ marginBottom: 8 }}>{detailModal.data.name}</Title>
            <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>{detailModal.data.price?.toLocaleString('vi-VN')}đ</Text>
            <div style={{ margin: '18px 0', color: '#555', fontSize: 16 }}>{detailModal.data.description}</div>
            {detailModal.type === 'combo' && detailModal.data.items && (
              <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 340 }}>
                <Text strong>Các món trong combo:</Text>
                <ul style={{ marginTop: 8 }}>
                  {detailModal.data.items.map((item, idx) => (
                    <li key={idx} style={{ fontSize: 15 }}>{item.name} x{item.quantity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default TableOrderTest;