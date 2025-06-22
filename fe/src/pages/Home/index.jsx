import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Row, Col, Card, Carousel, Divider, Form, Input, DatePicker, TimePicker, Select, InputNumber, Modal, Badge, Avatar, message, Tabs } from 'antd';
import { UserOutlined, ShoppingCartOutlined, CalendarOutlined, HomeOutlined, MenuOutlined, EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { MinimalLogo } from '../../components/Logo';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { TabPane } = Tabs;

// Fake data
const fakeCategories = [
  { _id: 'cat1', title: 'Món khai vị' },
  { _id: 'cat2', title: 'Món chính' },
  { _id: 'cat3', title: 'Món tráng miệng' },
  { _id: 'cat4', title: 'Đồ uống' }
];

const fakeFoods = [
  {
    _id: 'food1',
    name: 'Salad Caesar',
    description: 'Salad tươi mát với sốt Caesar đặc biệt',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    categoryId: 'cat1'
  },
  {
    _id: 'food2',
    name: 'Chả cá Lã Vọng',
    description: 'Món chả cá truyền thống Hà Nội',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    categoryId: 'cat2'
  },
  {
    _id: 'food3',
    name: 'Tiramisu',
    description: 'Bánh tiramisu Italy chính hiệu',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    categoryId: 'cat3'
  },
  {
    _id: 'food4',
    name: 'Trà đào cam sả',
    description: 'Thức uống giải khát tự nhiên',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    categoryId: 'cat4'
  },
  {
    _id: 'food5',
    name: 'Gỏi cuốn tôm thịt',
    description: 'Gỏi cuốn tươi ngon với tôm và thịt',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1559847844-d7b4ac063cd4?w=400&h=300&fit=crop',
    categoryId: 'cat1'
  },
  {
    _id: 'food6',
    name: 'Bò lúc lắc',
    description: 'Thịt bò áp chảo với rau củ',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    categoryId: 'cat2'
  },
  {
    _id: 'food7',
    name: 'Kem vani',
    description: 'Kem vani thơm ngon mát lạnh',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    categoryId: 'cat3'
  },
  {
    _id: 'food8',
    name: 'Cà phê sữa đá',
    description: 'Cà phê Việt Nam truyền thống',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
    categoryId: 'cat4'
  }
];

const fakeFeedbacks = [
  {
    _id: 'fb1',
    userId: { userName: 'Nguyễn Văn A' },
    rating: 5,
    comment: 'Món ăn rất ngon, phục vụ tận tình. Tôi sẽ quay lại!',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: 'fb2',
    userId: { userName: 'Trần Thị B' },
    rating: 4,
    comment: 'Không gian đẹp, thức ăn chất lượng. Giá cả hợp lý.',
    createdAt: '2024-01-12T14:20:00Z'
  },
  {
    _id: 'fb3',
    userId: { userName: 'Lê Minh C' },
    rating: 5,
    comment: 'Dịch vụ xuất sắc, đồ ăn tuyệt vời. Highly recommended!',
    createdAt: '2024-01-10T19:45:00Z'
  },
  {
    _id: 'fb4',
    userId: { userName: 'Phạm Thị D' },
    rating: 4,
    comment: 'Món ăn ngon, nhân viên thân thiện. Sẽ giới thiệu bạn bè.',
    createdAt: '2024-01-08T12:15:00Z'
  },
  {
    _id: 'fb5',
    userId: { userName: 'Hoàng Văn E' },
    rating: 5,
    comment: 'Trải nghiệm tuyệt vời! Cả gia đình đều hài lòng.',
    createdAt: '2024-01-05T18:30:00Z'
  },
  {
    _id: 'fb6',
    userId: { userName: 'Vũ Thị F' },
    rating: 4,
    comment: 'Không gian ấm cúng, thức ăn đậm đà hương vị.',
    createdAt: '2024-01-03T16:00:00Z'
  }
];

const HomePage = () => {
  const { 
    cartItems, 
    setCartItems, 
    setReservationModal, 
    cartModal, 
    setCartModal 
  } = useOutletContext();
    
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reservationForm] = Form.useForm();
  const [tableTypes, setTableTypes] = useState([
    { type: 2, description: "Bàn 2 người" },
    { type: 4, description: "Bàn 4 người" },
    { type: 6, description: "Bàn 6 người" },
    { type: 8, description: "Bàn 8 người" }
  ]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  // Load fake data
  useEffect(() => {
    setFeedbacks(fakeFeedbacks);
    setCategories(fakeCategories);
    setFoods(fakeFoods);
    setFeaturedFoods(fakeFoods.slice(0, 4));
    if (fakeCategories.length > 0) {
      setSelectedCategory(fakeCategories[0]._id);
    }
  }, []);

  const handleAddToCart = (food) => {
    const existingItem = cartItems.find(item => item.foodId === food._id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.foodId === food._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { foodId: food._id, food: food, quantity: 1 }]);
    }
    
    message.success(`Đã thêm ${food.name} vào giỏ hàng`);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.food.price * item.quantity), 0);
  };

  const handleReservationSubmit = (values) => {
    console.log('Đặt bàn:', values);
    message.success('Đặt bàn thành công!');
    setReservationModal(false);
    reservationForm.resetFields();
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      message.warning('Vui lòng chọn món trước khi đặt hàng');
      return;
    }
    
    console.log('Đặt món:', cartItems);
    message.success('Đặt món thành công!');
    setCartItems([]);
    setCartModal(false);
  };

  const renderFoodItems = () => {
    const filteredFoods = selectedCategory ? foods.filter(food => food.categoryId === selectedCategory) : foods;
    
    return (
      <Row gutter={[16, 16]}>
        {filteredFoods.map(food => (
          <Col xs={24} sm={12} md={8} key={food._id}>
            <Card
              hoverable
              cover={<img alt={food.name} src={food.image} style={{ height: 200, objectFit: 'cover' }} />}
              actions={[
                <Button type="primary" onClick={() => handleAddToCart(food)}>
                  <ShoppingCartOutlined /> Thêm vào giỏ
                </Button>
              ]}
            >
              <Meta
                title={<span>{food.name} <span style={{ color: '#ff4d4f', float: 'right' }}>{food.price.toLocaleString('vi-VN')}đ</span></span>}
                description={food.description}
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderCartItems = () => {
    return (
      <div>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ShoppingCartOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <p>Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <Row key={index} style={{ marginBottom: 10, padding: 10, borderBottom: '1px solid #f0f0f0' }}>
                <Col span={16}>
                  <Text strong>{item.food.name}</Text>
                  <br />
                  <Text type="secondary">{item.food.price.toLocaleString('vi-VN')}đ x {item.quantity}</Text>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Text strong>{(item.food.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
                  <br />
                  <Button.Group size="small">
                    <Button 
                      onClick={() => setCartItems(cartItems.map(cartItem => 
                        cartItem.foodId === item.foodId && cartItem.quantity > 1 
                          ? { ...cartItem, quantity: cartItem.quantity - 1 } 
                          : cartItem
                      ))}
                    >-</Button>
                    <Button>{item.quantity}</Button>
                    <Button 
                      onClick={() => setCartItems(cartItems.map(cartItem => 
                        cartItem.foodId === item.foodId 
                          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                          : cartItem
                      ))}
                    >+</Button>
                  </Button.Group>
                </Col>
              </Row>
            ))}
            <Divider />
            <Row>
              <Col span={12}>
                <Text strong>Tổng cộng:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                  {calculateTotal().toLocaleString('vi-VN')}đ
                </Text>
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col span={24}>
                <Button type="primary" block size="large" onClick={handlePlaceOrder}>
                  Đặt món
                </Button>
              </Col>
            </Row>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Banner */}
      <Carousel autoplay>
        <div>
          <div style={{ height: '500px', color: '#fff', background: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=500&fit=crop) center/cover no-repeat' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '0 50px' 
            }}>
              <MinimalLogo 
                style={{
                  color: '#fff'
                }}
                showTagline={false}
              />
              <Title style={{ color: '#fff' }}></Title>
              <Title level={3} style={{ color: '#fff', marginTop: 0 }}>Nơi hội tụ tinh hoa ẩm thực</Title>
              <Button type="primary" size="large" onClick={() => navigate('/test-table-order')}>
                Đặt bàn ngay
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div style={{ height: '500px', color: '#fff', background: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=500&fit=crop) center/cover no-repeat' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '0 50px' 
            }}>
              <Title style={{ color: '#fff' }}>Trải nghiệm ẩm thực đỉnh cao</Title>
              <Title level={3} style={{ color: '#fff', marginTop: 0 }}>Với các món ăn đặc sắc</Title>
              <Button type="primary" size="large" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
                Xem thực đơn
              </Button>
            </div>
          </div>
        </div>
      </Carousel>

      {/* Giới thiệu */}
      <div style={{ padding: '50px 50px', background: '#fff' }}>
        <Row gutter={32} align="middle">
          <Col xs={24} md={12}>
            <Title>Về nhà hàng chúng tôi</Title>
            <Paragraph style={{ fontSize: 16 }}>
              <strong>The Fool Restaurant</strong> tự hào mang đến cho quý khách những trải nghiệm ẩm thực đẳng cấp với các món ăn được chế biến từ nguyên liệu tươi ngon nhất.
            </Paragraph>
            <Paragraph style={{ fontSize: 16 }}>
              Với không gian sang trọng và đội ngũ nhân viên chuyên nghiệp, chúng tôi cam kết mang đến cho quý khách những giây phút thư giãn và tận hưởng ẩm thực tuyệt vời.
            </Paragraph>
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Địa điểm</Text>
                  <br />
                  <Text>FPT University, Hòa Lạc</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <PhoneOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Liên hệ</Text>
                  <br />
                  <Text>0904 628 569</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Giờ mở cửa</Text>
                  <br />
                  <Text>10:00 - 22:00</Text>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={12}>
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" 
              alt="Nhà hàng BỰ" 
              style={{ width: '100%', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
            />
          </Col>
        </Row>
      </div>

      {/* Món ăn nổi bật */}
      <div style={{ padding: '50px 50px', background: '#f5f5f5' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Món ăn đặc sắc</Title>

        <Row gutter={[16, 16]}>
          {featuredFoods.map(food => (
            <Col xs={24} sm={12} md={6} key={food._id} >
              <Card
                hoverable
                style={{height: '45vh'}}
                cover={<img alt={food.name} src={food.image} style={{ height: 200, objectFit: 'cover' }} />}
                actions={[
                  <Button type="primary" onClick={() => handleAddToCart(food)}>
                    <ShoppingCartOutlined /> Thêm vào giỏ
                  </Button>
                ]}
              >
                <Meta
                  title={<span>{food.name} <span style={{ color: '#ff4d4f', float: 'right', }}>{food.price.toLocaleString('vi-VN')}đ</span></span>}
                  description={food.description}
                />
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button type="primary" size="large" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
            Xem tất cả món ăn
          </Button>
        </div>
      </div>

      {/* Thực đơn */}
      <div id="menu" style={{ padding: '50px 50px', background: '#fff' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Thực đơn</Title>
        <Tabs 
          centered 
          activeKey={selectedCategory} 
          onChange={setSelectedCategory}
        >
          {categories.map(category => (
            <TabPane tab={category.title} key={category._id}>
              {renderFoodItems()}
            </TabPane>
          ))}
        </Tabs>
      </div>

      {/* Đánh giá */}
      <div style={{ padding: '50px 50px', background: '#f5f5f5' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Đánh giá từ khách hàng</Title>
        <Row gutter={[16, 16]} justify="center">
          {feedbacks.map(feedback => (
            <Col xs={24} sm={12} md={8} key={feedback._id}>
              <Card style={{ height: '100%' }}>
                <Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div>
                      {feedback.userId.userName}
                      <div style={{ float: 'right' }}>
                        {[...Array(5)].map((_, i) => (
                          i < feedback.rating ? 
                          <StarFilled key={i} style={{ color: '#ffc53d' }} /> : 
                          <StarOutlined key={i} style={{ color: '#ffc53d' }} />
                        ))}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <p>{feedback.comment}</p>
                      <Text type="secondary">{moment(feedback.createdAt).format('DD/MM/YYYY')}</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      
    </>
  );
};

export default HomePage;