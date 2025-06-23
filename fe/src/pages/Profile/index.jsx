import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
  HomeOutlined
} from '@ant-design/icons';
import './profile.css';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Real data states
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState(null);
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
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:9999/api/users/${userData.userId}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setUser(response.data.data);
        form.setFieldsValue(response.data.data);
      } else {
        message.error(response.data.message || 'Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      message.error('Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch loyalty information
  const fetchLoyaltyInfo = async () => {
    if (!userData?.userId) return;
    
    setLoadingLoyalty(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:9999/api/users/${userData.userId}/loyalty`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setLoyaltyInfo(response.data.data);
      } else {
        console.error('Lỗi khi lấy thông tin tích điểm:', response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin tích điểm:', error);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  // Fetch user coupons
  const fetchCoupons = async () => {
    if (!userData?.userId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:9999/api/users/${userData.userId}/coupons`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setCoupons(response.data.data);
      } else {
        console.error('Lỗi khi lấy mã giảm giá:', response.data.message);
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
    if (key === 'loyalty' && !loyaltyInfo) {
      fetchLoyaltyInfo();
    }
    if (key === 'coupons' && coupons.length === 0) {
      fetchCoupons();
    }
  };

  const onFinish = async (values) => {
    if (!userData?.userId) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:9999/api/users/${userData.userId}/profile`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setUser(response.data.data);
        message.success('Cập nhật thông tin thành công!');
        setEditMode(false);
      } else {
        message.error(response.data.message || 'Không thể cập nhật thông tin');
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
          <Badge 
            count={loyaltyInfo ? <TrophyOutlined style={{ color: loyaltyInfo.membershipLevel.color }} /> : 0} 
            offset={[-5, 5]}
          >
            <Avatar 
              size={80} 
              icon={<UserOutlined />} 
              className="user-avatar"
              src={user.avatar}
            />
          </Badge>
          <Title level={4} className="username">{user.fullname || user.username}</Title>
          <Text type="secondary">{user.email}</Text>
          
          <div className="membership-badge">
            {loyaltyInfo && (
              <Text strong style={{ color: loyaltyInfo.membershipLevel.color }}>
                Thành viên {loyaltyInfo.membershipLevel.name}
              </Text>
            )}
          </div>
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
          <Menu.Item key="loyalty" icon={<TrophyOutlined className="menu-icon" />} className="menu-item">
            Điểm tích lũy & Hạng thành viên
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
                {activeTab === 'loyalty' && 'Điểm tích lũy & Hạng thành viên'}
                {activeTab === 'reservations' && 'Lịch sử đặt bàn'}
                {activeTab === 'coupons' && 'Mã giảm giá của tôi'}
              </Title>
              <Paragraph className="header-subtitle">
                {activeTab === 'profile' && 'Quản lý thông tin cá nhân của bạn'}
                {activeTab === 'loyalty' && 'Theo dõi điểm tích lũy và cấp độ thành viên'}
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

        {/* Loyalty Tab */}
        {activeTab === 'loyalty' && (
          <Spin spinning={loadingLoyalty}>
            {loyaltyInfo ? (
              <Row gutter={24} className="stats-row">
                <Col span={24}>
                  <Card className="loyalty-card">
                    <Row>
                      <Col span={8}>
                        <Statistic 
                          title="Điểm tích lũy hiện tại" 
                          value={loyaltyInfo.points} 
                          prefix={<TrophyOutlined />} 
                          valueStyle={{ color: '#1890ff', fontSize: '2rem' }}
                          className="loyalty-statistic"
                        />
                      </Col>
                      <Col span={8}>
                        <div className="membership-info">
                          <Title level={4}>Hạng thành viên</Title>
                          <div className="membership-badge-large" style={{ backgroundColor: loyaltyInfo.membershipLevel.color }}>
                            <Text strong style={{ color: '#fff', fontSize: '1.5rem' }}>
                              {loyaltyInfo.membershipLevel.name}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        {loyaltyInfo.nextLevel ? (
                          <Statistic 
                            title={`Điểm để lên hạng ${loyaltyInfo.nextLevel.name}`} 
                            value={loyaltyInfo.nextLevel.pointsToNext} 
                            valueStyle={{ color: '#f5222d' }}
                            className="loyalty-statistic"
                          />
                        ) : (
                          <Statistic 
                            title="Trạng thái" 
                            value="Đã đạt hạng cao nhất" 
                            valueStyle={{ color: '#52c41a' }}
                            className="loyalty-statistic"
                          />
                        )}
                      </Col>
                    </Row>
                    
                    {loyaltyInfo.nextLevel && (
                      <div className="progress-wrapper">
                        <Title level={5}>Tiến độ lên hạng {loyaltyInfo.nextLevel.name}</Title>
                        <Progress 
                          percent={loyaltyInfo.progressPercentage} 
                          status="active" 
                          strokeColor={loyaltyInfo.membershipLevel.color}
                        />
                      </div>
                    )}
                    
                    <Divider />
                    
                    <Title level={4}>Quyền lợi thành viên</Title>
                    <Row gutter={16} className="benefits-row">
                      <Col span={6}>
                        <Card className="benefit-card bronze">
                          <Title level={5} style={{ color: '#CD7F32' }}>Thành viên Đồng</Title>
                          <List size="small">
                            <List.Item>Đổi điểm lấy voucher</List.Item>
                            <List.Item>Tích điểm 5% giá trị đơn</List.Item>
                          </List>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card className="benefit-card silver">
                          <Title level={5} style={{ color: '#C0C0C0' }}>Thành viên Bạc</Title>
                          <List size="small">
                            <List.Item>Tích điểm 7% giá trị đơn</List.Item>
                            <List.Item>Voucher đặc biệt sinh nhật</List.Item>
                            <List.Item>Ưu tiên đặt bàn</List.Item>
                          </List>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card className="benefit-card gold">
                          <Title level={5} style={{ color: '#FFD700' }}>Thành viên Vàng</Title>
                          <List size="small">
                            <List.Item>Tích điểm 10% giá trị đơn</List.Item>
                            <List.Item>Voucher giảm giá độc quyền</List.Item>
                            <List.Item>Gọi món đặc biệt không có trong menu</List.Item>
                          </List>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card className="benefit-card platinum">
                          <Title level={5} style={{ color: '#e5e4e2' }}>Thành viên Bạch Kim</Title>
                          <List size="small">
                            <List.Item>Tích điểm 15% giá trị đơn</List.Item>
                            <List.Item>Phòng VIP miễn phí</List.Item>
                            <List.Item>Dịch vụ đón tiễn</List.Item>
                            <List.Item>Tư vấn đầu bếp riêng</List.Item>
                          </List>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Card>
                <div className="empty-state">
                  <TrophyOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                  <Title level={4}>Chưa có thông tin tích điểm</Title>
                  <Paragraph>Hãy đặt bàn để bắt đầu tích điểm!</Paragraph>
                </div>
              </Card>
            )}
          </Spin>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <Card className="reservations-card">
            <div className="empty-state">
              <CalendarOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
              <Title level={4}>Chưa có lịch đặt bàn</Title>
              <Paragraph>Bạn chưa có đơn đặt bàn nào. Hãy đặt bàn ngay để trải nghiệm dịch vụ của chúng tôi.</Paragraph>
              <Button type="primary" onClick={() => navigate('/booking')}>Đặt bàn ngay</Button>
            </div>
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
                    <Card className="coupon-item">
                      <div className="coupon-info">
                        <Title level={4}>{coupon.couponName}</Title>
                        <Paragraph>{coupon.description}</Paragraph>
                        <div className="coupon-value">
                          <DollarOutlined /> <Text strong>{coupon.discountValue}{coupon.discountType === 'percent' ? '%' : ' VND'}</Text>
                        </div>
                      </div>
                      <div className="coupon-validity">
                        <Text type="secondary">
                          Hạn sử dụng: {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </Text>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div className="empty-state">
                <GiftOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                <Title level={4}>Chưa có mã giảm giá</Title>
                <Paragraph>Bạn chưa có mã giảm giá nào. Hãy tích điểm để đổi lấy những ưu đãi hấp dẫn!</Paragraph>
                <Button type="primary" onClick={() => handleTabChange('loyalty')}>Xem điểm tích lũy</Button>
              </div>
            )}
          </Card>
        )}
      </Layout>
    </Layout>
  );
};

export default UserProfile;
