import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Tabs, Button, Typography, Divider, Badge, Space, Tag, Modal, Tooltip, Spin } from 'antd';
import { PlusOutlined, MinusOutlined, CheckCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import tableService from '../../../services/table.service';
import { foodService } from '../../../services/food.service';
import comboService from '../../../services/combo.service';
import servantService from '../../../services/servant.service';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ServantOrder = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [foodCategories, setFoodCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all-foods');
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPlacedOrdersModal, setShowPlacedOrdersModal] = useState(false);
  const [placedOrders, setPlacedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchFoods();
    fetchCombos();
    fetchCategories();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await servantService.getAllTablesWithStatus();
      setTables(res || []);
    } catch (err) {
      setTables([]);
    }
    setLoading(false);
  };

  // Khi chọn bàn, lấy currentReservation nếu có
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    if (Array.isArray(table.currentReservation) && table.currentReservation.length > 0) {
      setCurrentReservation(table.currentReservation[0]);
    } else {
      setCurrentReservation(null);
    }
    setCart([]);
    setPlacedOrders([]);
  };

  const fetchFoods = async () => {
    const res = await foodService.getAllFoods();
    setFoods(res.data || res.foods || res || []);
  };
  const fetchCombos = async () => {
    const res = await comboService.getAllCombos();
    setCombos(res.data || res.combos || res || []);
  };
  const fetchCategories = async () => {
    const res = await foodService.getAllFoodCategories();
    setFoodCategories(res.data || res.categories || res || []);
    if (!selectedTab && (res.data || res.categories || res)?.length > 0) {
      setSelectedTab('all-foods');
    }
  };

  // Tabs logic
  const renderFoods = () => {
    if (selectedTab === 'all-foods') {
      return foods.filter(f => !f.isCombo).map(food => (
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
              />
            }
            actions={[
              <Tooltip title={!selectedTable || !currentReservation ? 'Chỉ gọi món cho bàn đang sử dụng' : ''}>
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
                  onClick={() => selectedTable && currentReservation && addToCart(food, 'food')}
                  disabled={!selectedTable || !currentReservation}
                >
                  <PlusOutlined /> Thêm
                </Button>
              </Tooltip>
            ]}
          >
            <Card.Meta
              title={<span style={{ fontWeight: 700, fontSize: 18, color: '#6366f1', cursor: 'pointer' }}>{food.name}</span>}
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
      ));
    }
    if (selectedTab === 'combos') {
      return combos.map(combo => (
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
              />
            }
            actions={[
              <Tooltip title={!selectedTable || !currentReservation ? 'Chỉ gọi món cho bàn đang sử dụng' : ''}>
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
                  onClick={() => selectedTable && currentReservation && addToCart(combo, 'combo')}
                  disabled={!selectedTable || !currentReservation}
                >
                  <PlusOutlined /> Thêm
                </Button>
              </Tooltip>
            ]}
          >
            <Card.Meta
              title={<span style={{ fontWeight: 700, fontSize: 18, color: '#10b981', cursor: 'pointer' }}>{combo.name}</span>}
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 15 }}>{combo.description}</Text>
                  <br />
                  <Text strong style={{ color: '#ff4d4f', fontSize: 17 }}>
                    {combo.price?.toLocaleString('vi-VN')}đ
                  </Text>
                </div>
              }
            />
          </Card>
        </Col>
      ));
    }
    // Tab category
    return foods.filter(f => String(f.categoryId?._id || f.categoryId) === String(selectedTab) && !f.isCombo).map(food => (
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
            />
          }
          actions={[
            <Tooltip title={!selectedTable || !currentReservation ? 'Chỉ gọi món cho bàn đang sử dụng' : ''}>
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
                onClick={() => selectedTable && currentReservation && addToCart(food, 'food')}
                disabled={!selectedTable || !currentReservation}
              >
                <PlusOutlined /> Thêm
              </Button>
            </Tooltip>
          ]}
        >
          <Card.Meta
            title={<span style={{ fontWeight: 700, fontSize: 18, color: '#6366f1', cursor: 'pointer' }}>{food.name}</span>}
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
    ));
  };

  // Thêm món vào cart (chỉ tăng đúng 1 đơn vị mỗi lần click)
  const addToCart = (item, type) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item._id && i.type === type);
      if (idx !== -1) {
        // Đã có, tăng đúng 1 đơn vị
        const newCart = [...prev];
        newCart[idx] = { ...newCart[idx], quantity: newCart[idx].quantity + 1 };
        return newCart;
      }
      // Chưa có, thêm mới
      return [...prev, { id: item._id, name: item.name, price: item.price, type, quantity: 1, image: item.images?.[0] || item.image }];
    });
  };

  // Cập nhật số lượng món trong cart
  const updateCartQuantity = (id, type, newQuantity) => {
    setCart(prev => {
      if (newQuantity <= 0) {
        return prev.filter(item => !(item.id === id && item.type === type));
      }
      return prev.map(item =>
        item.id === id && item.type === type ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || !currentReservation || cart.length === 0) return;
    setSubmitting(true);
    try {
      const order = {
        tableId: selectedTable._id,
        reservationId: currentReservation._id,
        foods: cart.filter(i => i.type === 'food').map(i => ({ foodId: i.id, quantity: i.quantity })),
        combos: cart.filter(i => i.type === 'combo').map(i => i.id),
        status: 'pending',
      };
      await tableService.createTableOrder({ orders: [order] });
      setCart([]);
      setShowPlacedOrdersModal(true);
      fetchPlacedOrders(selectedTable._id);
    } catch (err) {
      console.error('Error submitting order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Lấy danh sách order theo reservationId khi mở modal
  const fetchPlacedOrders = async (tableId) => {
    setLoading(true);
    try {
      if (!currentReservation) {
        setPlacedOrders([]);
        setLoading(false);
        return;
      }
      // Lấy order theo reservationId
      const res = await tableService.getOrdersByReservationId(currentReservation._id);
      let orders = res.data || res || [];
      // Sắp xếp: đơn chưa completed lên trên, completed xuống dưới, mới nhất trên đầu
      orders = orders.sort((a, b) => {
        if (a.status === b.status) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
        return 0;
      });
      setPlacedOrders(orders);
    } catch (err) {
      setPlacedOrders([]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f4f6fb 100%)' }}>
      <Row gutter={28}>
        {/* Cột trái: Danh sách bàn */}
        <Col xs={24} md={5}>
          <Card title={<span style={{ fontWeight: 600, fontSize: 18 }}>Danh sách bàn</span>} style={{ borderRadius: 12, boxShadow: '0 2px 12px #6366f108', marginBottom: 24, border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}>
            <List
              dataSource={tables}
              renderItem={table => {
                const isOccupied = Array.isArray(table.currentReservation) && table.currentReservation.length > 0;
                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: selectedTable?._id === table._id ? 'linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)' : 'transparent',
                      marginBottom: '8px',
                      fontWeight: selectedTable?._id === table._id ? 700 : 500,
                      color: selectedTable?._id === table._id ? '#6366f1' : '#1a2341',
                      border: selectedTable?._id === table._id ? '2px solid #6366f1' : '1.5px solid #e0e7ff',
                      boxShadow: selectedTable?._id === table._id ? '0 2px 12px #6366f122' : 'none',
                      transition: 'all 0.25s',
                      opacity: isOccupied ? 1 : 0.5
                    }}
                    onClick={() => handleSelectTable(table)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span>Bàn {table.tableNumber}</span>
                      <Tag color={isOccupied ? 'orange' : 'green'}>{isOccupied ? 'Đang sử dụng' : 'Trống'}</Tag>
                    </div>

                    {/* Hiển thị mã đặt bàn nếu có */}
                    {isOccupied && table.currentReservation[0]?.reservationCode && (
                      <div style={{ fontSize: 13, color: '#1677ff', fontWeight: 600 }}>Mã : {table.currentReservation[0].reservationCode}</div>
                    )}
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        {/* Cột giữa: Danh sách món ăn/combo */}
        <Col xs={24} md={14}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px #6366f108', border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}>
            {!selectedTable ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                <p>Chọn bàn để bắt đầu gọi món</p>
              </div>
            ) : !currentReservation ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                <p>Bàn trống, chưa thể gọi món</p>
              </div>
            ) : (
              <Tabs activeKey={selectedTab} onChange={setSelectedTab} style={{ background: 'transparent' }}>
                <TabPane tab={<span style={{ fontWeight: 600, fontSize: 17, color: '#6366f1' }}>Tất cả món ăn</span>} key="all-foods">
                  <Row gutter={[20, 20]}>{selectedTab === 'all-foods' && renderFoods()}</Row>
                </TabPane>
                <TabPane tab={<span style={{ fontWeight: 600, fontSize: 17, color: '#10b981' }}>Combo</span>} key="combos">
                  <Row gutter={[20, 20]}>{selectedTab === 'combos' && renderFoods()}</Row>
                </TabPane>
                {foodCategories.map(category => (
                  <TabPane tab={<span style={{ fontWeight: 600, fontSize: 17 }}>{category.title}</span>} key={category._id}>
                    <Row gutter={[20, 20]}>{selectedTab === category._id && renderFoods()}</Row>
                  </TabPane>
                ))}
              </Tabs>
            )}
          </Card>
        </Col>
        {/* Cột phải: Cart và xác nhận */}
        <Col xs={24} md={5}>
          <Card 
            title={<span style={{ fontWeight: 600, fontSize: 18, color: '#6366f1' }}>{selectedTable ? `Giỏ hàng - Bàn ${selectedTable.tableNumber}` : 'Giỏ hàng (Vui lòng chọn bàn)'}</span>}
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', border: '1.5px solid #e0e7ff', background: 'rgba(255,255,255,0.97)' }}
          >
            {!selectedTable ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                <p>Chọn bàn để bắt đầu gọi món</p>
              </div>
            ) : !currentReservation ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                <p>Bàn trống, chưa thể gọi món</p>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#b0b3bb', fontSize: 18 }}>
                <ShoppingCartOutlined style={{ fontSize: 54, color: '#ccc' }} />
                <p>Giỏ hàng trống</p>
              </div>
            ) : (
              <div>
                {cart.map((item, index) => (
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
                      {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('vi-VN')}đ
                    </Text>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  style={{ borderRadius: 8, fontWeight: 600, fontSize: 17, background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)', border: 'none', boxShadow: '0 2px 8px #6366f133', transition: 'background 0.2s' }}
                  loading={submitting}
                  disabled={!selectedTable || !currentReservation || cart.length === 0}
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
              onClick={() => {
                if (selectedTable) fetchPlacedOrders(selectedTable._id);
                setShowPlacedOrdersModal(true);
              }}
            >
              Xem đơn đã gọi
            </Button>
          </Card>
        </Col>
      </Row>
      {/* Modal xem đơn đã gọi */}
      <Modal
        open={showPlacedOrdersModal}
        title={`Đơn đã gọi cho bàn ${selectedTable?.tableNumber || ''}`}
        onCancel={() => setShowPlacedOrdersModal(false)}
        footer={null}
        width={700}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Đang tải...</div>
        ) : placedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Chưa có đơn nào.</div>
        ) : (
          placedOrders.map((order, idx) => (
            <div key={order._id || idx} style={{
              marginBottom: 18,
              background: order.status === 'pending' ? '#f0fdfa' : order.status === 'completed' ? '#f8fafc' : '#f3f4f6',
              border: order.status === 'pending' ? '2px solid #10b981' : order.status === 'completed' ? '1.5px solid #e0e7ff' : '1.5px solid #b0b3bb',
              borderRadius: 10,
              padding: 16,
              boxShadow: order.status === 'pending' ? '0 2px 8px #10b98122' : '0 1px 4px #6366f111',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b>Đơn số: {idx + 1}</b>
                <span style={{ color: order.status === 'pending' ? '#10b981' : order.status === 'completed' ? '#6366f1' : '#b0b3bb', fontWeight: 600 }}>{order.status}</span>
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
    </div>
  );
};

export default ServantOrder; 