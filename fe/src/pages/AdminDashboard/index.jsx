import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Tag, 
  Progress,
  Divider,
  Button,
  Avatar,
  List,
  Badge
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TrophyOutlined,
  TeamOutlined,
  DollarOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import foodService from '../../services/food.service';
import authService from '../../services/auth.service';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFoods: 0,
    totalCombos: 0,
    totalCategories: 0,
    activeUsers: 0,
    availableFoods: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from various services
      const [foodsRes, categoriesRes, combosRes] = await Promise.all([
        foodService.getAllFoods().catch(() => []),
        foodService.getAllFoodCategories().catch(() => []),
        foodService.getAllCombos().catch(() => [])
      ]);

      const foods = foodsRes || [];
      const categories = categoriesRes || [];
      const combos = combosRes || [];

      setStats({
        totalUsers: 156, // Mock data - replace with actual API call
        totalFoods: foods.length,
        totalCombos: combos.length,
        totalCategories: categories.length,
        activeUsers: 89, // Mock data
        availableFoods: foods.filter(food => food.isAvailable).length
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'food_added',
          message: 'Đã thêm món ăn mới: Phở Bò Tái',
          time: '2 giờ trước',
          icon: <AppstoreOutlined style={{ color: '#52c41a' }} />
        },
        {
          id: 2,
          type: 'user_registered',
          message: 'Người dùng mới đăng ký: user123@gmail.com',
          time: '3 giờ trước',
          icon: <UserOutlined style={{ color: '#1890ff' }} />
        },
        {
          id: 3,
          type: 'combo_updated',
          message: 'Đã cập nhật combo: Combo Gia Đình',
          time: '5 giờ trước',
          icon: <ShoppingCartOutlined style={{ color: '#faad14' }} />
        },
        {
          id: 4,
          type: 'category_added',
          message: 'Đã thêm danh mục: Đồ Uống',
          time: '1 ngày trước',
          icon: <TagsOutlined style={{ color: '#eb2f96' }} />
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Thêm món ăn mới',
      description: 'Thêm món ăn vào menu',
      icon: <AppstoreOutlined />,
      color: '#52c41a',
      action: () => navigate('/admin/foods')
    },
    {
      title: 'Thêm combo mới',
      description: 'Tạo combo cho khách hàng',
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      action: () => navigate('/admin/combos')
    },
    {
      title: 'Quản lý tài khoản',
      description: 'Xem và quản lý người dùng',
      icon: <UserOutlined />,
      color: '#faad14',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Quản lý danh mục',
      description: 'Tổ chức danh mục món ăn',
      icon: <TagsOutlined />,
      color: '#eb2f96',
      action: () => navigate('/admin/food-categories')
    }
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#001529' }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Dashboard Tổng Quan
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Chào mừng bạn quay trở lại! Đây là thống kê tổng quan của hệ thống.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  <RiseOutlined /> +12%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng món ăn"
              value={stats.totalFoods}
              prefix={<AppstoreOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <Tag color="green" style={{ marginLeft: 8 }}>
                  <RiseOutlined /> +8%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng combo"
              value={stats.totalCombos}
              prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
              suffix={
                <Tag color="orange" style={{ marginLeft: 8 }}>
                  <RiseOutlined /> +15%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Danh mục"
              value={stats.totalCategories}
              prefix={<TagsOutlined style={{ color: '#eb2f96' }} />}
              suffix={
                <Tag color="magenta" style={{ marginLeft: 8 }}>
                  Ổn định
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Detail Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Thống kê chi tiết" loading={loading}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Người dùng hoạt động</Text>
                  <Text strong>{stats.activeUsers}/{stats.totalUsers}</Text>
                </div>
                <Progress 
                  percent={Math.round((stats.activeUsers / stats.totalUsers) * 100)} 
                  strokeColor="#1890ff" 
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Món ăn có sẵn</Text>
                  <Text strong>{stats.availableFoods}/{stats.totalFoods}</Text>
                </div>
                <Progress 
                  percent={Math.round((stats.availableFoods / stats.totalFoods) * 100)} 
                  strokeColor="#52c41a" 
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Hoạt động hôm nay</Text>
                  <Text strong>24 hoạt động</Text>
                </div>
                <Progress 
                  percent={85} 
                  strokeColor="#faad14" 
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Hoạt động gần đây" loading={loading}>
            <List
              size="small"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={<Text style={{ fontSize: '14px' }}>{item.message}</Text>}
                    description={<Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Hành động nhanh" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card 
                hoverable 
                size="small"
                style={{ 
                  textAlign: 'center',
                  border: `1px solid ${action.color}20`,
                  backgroundColor: `${action.color}05`
                }}
                onClick={action.action}
              >
                <div style={{ 
                  fontSize: '32px', 
                  color: action.color, 
                  marginBottom: 8 
                }}>
                  {action.icon}
                </div>
                <Title level={5} style={{ margin: '8px 0 4px 0' }}>
                  {action.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {action.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard; 