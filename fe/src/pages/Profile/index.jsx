import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import userService from '../../services/user.service';
import { 
  Layout, 
  Menu, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Alert,
  Card, 
  Statistic, 
  Row, 
  Col,
  Badge,
  List,
  Tag,
  Progress,
  Divider,
  Spin,
  message
} from 'antd';

import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EditOutlined, 
  SaveOutlined, 
  GiftOutlined, 
  HistoryOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  CopyOutlined
} from '@ant-design/icons';
import './profile.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import ReservationHistory from './ReservationHistory';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Real data states
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    // Lấy thông tin người dùng từ token JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserData({
          username: decodedToken.username,
          role: decodedToken.role,
          userId: decodedToken.id
        });
      } catch (error) {
        console.error('Invalid token:', error);
        message.error('Phiên đăng nhập không hợp lệ');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch profile data when userData is available
  useEffect(() => {
    if (userData?.userId) {
      fetchProfile();
    }
  }, [userData]);

  // Fetch profile information
  const fetchProfile = async () => {
    if (!userData?.userId) return;
    
    setLoading(true);
    try {
      const response = await userService.getUserProfile(userData.userId);
      
      if (response.success) {
        setUser(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error(response.message || 'Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      message.error('Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };



  // Fetch user coupons
  const fetchCoupons = async () => {
    if (!userData?.userId) return;
    
    try {
      const response = await userService.getUserCoupons(userData.userId);
      
      if (response.success) {
        setCoupons(response.data);
      } else {
        console.error('Lỗi khi lấy mã giảm giá:', response.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy mã giảm giá:', error);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      form.setFieldsValue(user);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'coupons' && coupons.length === 0) {
      fetchCoupons();
    }
  };

  const onFinish = async (values) => {
    if (!userData?.userId) return;
    
    setUpdating(true);
    try {
      const response = await userService.updateUserProfile(userData.userId, values);
      
      if (response.success) {
        setUser(response.data);
        message.success('Cập nhật thông tin thành công!');
        setEditMode(false);
      } else {
        message.error(response.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      message.error('Lỗi khi cập nhật thông tin');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải thông tin người dùng..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-container">
        <Alert 
          message="Không thể tải thông tin người dùng" 
          type="error" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <Layout className="profile-layout">
      <Sider width={260} theme="light" className="profile-sider">
        <div className="sider-content">
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            className="user-avatar"
            src={user.avatar}
          />
          <Title level={4} className="username">{user.fullname || user.username}</Title>
          <Text type="secondary">{user.email}</Text>
        </div>
        
        <Menu 
          mode="inline" 
          selectedKeys={[activeTab]} 
          className="profile-menu"
          onClick={(e) => handleTabChange(e.key)}
        >
          <Menu.Item key="profile" icon={<UserOutlined className="menu-icon" />} className="menu-item">
            Thông tin cá nhân
          </Menu.Item>
          <Menu.Item key="reservations" icon={<HistoryOutlined className="menu-icon" />} className="menu-item">
            Lịch sử đặt bàn
          </Menu.Item>
          <Menu.Item key="coupons" icon={<GiftOutlined className="menu-icon" />} className="menu-item">
            Mã giảm giá ({coupons.length})
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout className="profile-content">
        <Card className="header-card">
          <Row>
            <Col span={16}>
              <Title level={3} className="header-title">
                {activeTab === 'profile' && 'Thông tin cá nhân'}
                {activeTab === 'reservations' && 'Lịch sử đặt bàn'}
                {activeTab === 'coupons' && 'Mã giảm giá của tôi'}
              </Title>
              <Paragraph className="header-subtitle">
                {activeTab === 'profile' && 'Quản lý thông tin cá nhân của bạn'}
                {activeTab === 'reservations' && 'Xem lại lịch sử đặt bàn của bạn'}
                {activeTab === 'coupons' && 'Danh sách mã giảm giá hiện có'}
              </Paragraph>
            </Col>
          </Row>
        </Card>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <Row gutter={24} className="stats-row">
              <Col span={12}>
                <Card className="stats-card">
                  <Statistic 
                    title="Điểm tích lũy" 
                    value={user.cumulativePoint || 0} 
                    prefix={<TrophyOutlined />} 
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card className="stats-card">
                  <Statistic 
                    title="Mã giảm giá" 
                    value={user.couponId?.length || 0} 
                    prefix={<GiftOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card className="form-card">
              <div className="form-header">
                <Title level={4} className="form-title">Thông tin cá nhân</Title>
                <Button 
                  type={editMode ? "primary" : "default"}
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  onClick={editMode ? form.submit : toggleEditMode}
                  loading={updating}
                  className="edit-button"
                >
                  {editMode ? "Lưu thay đổi" : "Chỉnh sửa"}
                </Button>
              </div>
              
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={user}
                disabled={!editMode}
                className="profile-form"
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item 
                      name="fullname" 
                      label="Họ và tên" 
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input 
                        prefix={<UserOutlined className="form-icon" />} 
                        placeholder="Họ và tên" 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name="username" 
                      label="Tên đăng nhập" 
                      rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                      <Input 
                        prefix={<UserOutlined className="form-icon" />} 
                        placeholder="Tên đăng nhập" 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item 
                      name="email" 
                      label="Email" 
                      rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                      <Input 
                        prefix={<MailOutlined className="form-icon" />} 
                        placeholder="Email" 
                        disabled 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name="phone" 
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined className="form-icon" />} 
                        placeholder="Số điện thoại" 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </>
        )}



        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <Card className="reservations-card">
            <ReservationHistory />
          </Card>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <Card className="coupons-card">
            {coupons.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={coupons}
                renderItem={(coupon) => (
                  <List.Item>
                    <Card className="coupon-item" style={{ 
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <Row gutter={16}>
                        <Col span={8}>
                          <div className="coupon-visual" style={{
                            background: `linear-gradient(135deg, ${coupon.discount_type === 'percent' ? '#52c41a' : '#faad14'} 0%, #ffd700 100%)`,
                            minHeight: 150
                          }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                              Coupon
                            </Text>
                            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                              {coupon.discount_type === 'percent' ? 
                                `${coupon.discount_value}%` : 
                                `${Number(coupon.discount_value).toLocaleString('vi-VN')}đ`}
                            </Text>
                          </div>
                        </Col>
                        <Col span={16}>
                          <div className="coupon-content">
                            <div style={{ marginBottom: 16 }}>
                              <Title level={4} style={{ margin: 0 }}>{coupon.coupon_name}</Title>
                              <Text type="secondary">{coupon.description}</Text>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <Text type="secondary">
                                Hạn sử dụng: {coupon.valid_to ? moment(coupon.valid_to).format('DD/MM/YYYY') : 'Không giới hạn'}
                              </Text>
                            </div>
                            
                            <div className="coupon-code-section">
                              <div>
                                <Text strong>Mã: </Text>
                                <Text code style={{ fontSize: 16, fontWeight: 'bold' }}>
                                  {coupon.coupon_code}
                                </Text>
                              </div>
                              <Button 
                                type="primary" 
                                icon={<CopyOutlined />}
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.coupon_code);
                                  message.success(`Đã sao chép mã: ${coupon.coupon_code}`);
                                }}
                              >
                                Sao chép
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-state">
                <GiftOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                <Title level={4}>Chưa có mã giảm giá</Title>
                <Paragraph>Bạn chưa có mã giảm giá nào. Hãy tích điểm để đổi lấy những ưu đãi hấp dẫn!</Paragraph>
                <Button type="primary" onClick={() => navigate('/vouchers')}>Xem ưu đãi</Button>
              </div>
            )}
          </Card>
        )}
      </Layout>
    </Layout>
  );
};

export default UserProfile;
