import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  DatePicker,
  Space,
  Table,
  Tag,
  Progress,
  Divider,
  Spin,
  Alert,
  Tabs,
  List,
  Avatar,
  Button
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  TableOutlined,
  ShoppingCartOutlined,
  CrownOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import adminService from '../../../services/admin.service';
import AdminDebugGuide from './AdminDebugGuide';
import './index.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AdminStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [reservationStats, setReservationStats] = useState(null);
  const [staffStats, setStaffStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);

  // Error states
  const [error, setError] = useState(null);

  // Chart colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  // Debug function to check authentication
  const debugAuth = () => {
    const token = localStorage.getItem('token');
    console.log('🔍 Debug Auth Info:');
    console.log('Token exists:', !!token);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('User role:', payload.role);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token valid:', payload.exp * 1000 > Date.now());
      } catch (e) {
        console.log('Token decode error:', e);
      }
    }
  };

  useEffect(() => {
    // Debug authentication on component mount
    debugAuth();
    loadAllStats();
  }, [period, dateRange]);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug before making API calls
      console.log('🚀 Loading stats with params:', { period, dateRange });

      const params = {
        period,
        ...(dateRange && {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        })
      };

      // Load stats with individual error handling
      const results = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getRevenueStats(params),
        adminService.getReservationStats(params),
        adminService.getStaffStats(params),
        adminService.getCustomerStats(params)
      ]);

      // Log each result for debugging
      results.forEach((result, index) => {
        const apiNames = ['Dashboard', 'Revenue', 'Reservations', 'Staff', 'Customers'];
        if (result.status === 'rejected') {
          console.error(`❌ ${apiNames[index]} API failed:`, result.reason);
        } else {
          console.log(`✅ ${apiNames[index]} API success`);
        }
      });

      // Handle each result safely
      const [dashboardResult, revenueResult, reservationsResult, staffResult, customersResult] = results;

      setDashboardStats(
        dashboardResult.status === 'fulfilled' ? dashboardResult.value?.data || {} : {}
      );
      setRevenueStats(
        revenueResult.status === 'fulfilled' ? revenueResult.value?.data || {} : {}
      );
      setReservationStats(
        reservationsResult.status === 'fulfilled' ? reservationsResult.value?.data || {} : {}
      );
      setStaffStats(
        staffResult.status === 'fulfilled' ? staffResult.value?.data || {} : {}
      );
      setCustomerStats(
        customersResult.status === 'fulfilled' ? customersResult.value?.data || {} : {}
      );

      // Check if any request failed and show warning
      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length > 0) {
        const failedErrors = failedRequests.map(req => req.reason?.message || 'Unknown error');
        setError(`Một số dữ liệu thống kê không thể tải được. Chi tiết: ${failedErrors.join(', ')}`);
        
        // Log detailed error information
        console.error('Failed requests details:', failedRequests);
      }

    } catch (error) {
      console.error('Error loading statistics:', error);
      
      // Enhanced error messages based on error type
      let errorMessage = 'Không thể tải dữ liệu thống kê. ';
      
      if (error?.response?.status === 401) {
        errorMessage += 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        // Redirect to login after a delay
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } else if (error?.response?.status === 403) {
        errorMessage += 'Bạn không có quyền truy cập vào dữ liệu này. Vui lòng liên hệ quản trị viên.';
      } else if (error?.response?.status >= 500) {
        errorMessage += 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage += 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
      
      // Set default empty states
      setDashboardStats({});
      setRevenueStats({});
      setReservationStats({});
      setStaffStats({});
      setCustomerStats({});
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    // Safe handling for null, undefined, NaN values
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(safeValue);
  };

  const formatNumber = (value) => {
    // Safe handling for null, undefined, NaN values
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('vi-VN').format(safeValue);
  };

  const safeGet = (obj, path, defaultValue = 0) => {
    // Safe getter with default value
    try {
      const result = path.split('.').reduce((current, key) => current?.[key], obj);
      return typeof result === 'number' && !isNaN(result) ? result : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const safeArray = (arr, defaultValue = []) => {
    // Safe array getter
    return Array.isArray(arr) ? arr : defaultValue;
  };

  if (loading) {
    return (
      <div className="admin-statistics-loading">
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Đang tải dữ liệu thống kê...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-statistics">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="admin-statistics-error"
          action={
            <Button 
              size="small" 
              danger 
              onClick={() => {
                debugAuth();
                loadAllStats();
              }}
            >
              Thử lại
            </Button>
          }
        />
        
                 {/* Debug Panel - chỉ hiển thị khi có lỗi authentication */}
         {(error.includes('401') || error.includes('403') || error.includes('quyền')) && (
           <Card title="🔍 Thông tin Debug" style={{ marginTop: 16 }}>
             <Space direction="vertical" style={{ width: '100%' }}>
               <Button 
                 onClick={() => {
                   const token = localStorage.getItem('token');
                   const info = token ? JSON.parse(atob(token.split('.')[1])) : null;
                   console.table({
                     'Token tồn tại': !!token,
                     'User Role': info?.role || 'N/A',
                     'Username': info?.username || 'N/A',
                     'Token hết hạn': info ? new Date(info.exp * 1000).toLocaleString() : 'N/A',
                     'Token còn hiệu lực': info ? (info.exp * 1000 > Date.now() ? 'Có' : 'Không') : 'N/A'
                   });
                   alert('Thông tin debug đã được log ra console. Nhấn F12 để xem.');
                 }}
               >
                 Kiểm tra Token Info
               </Button>
               
               <Button 
                 type="primary"
                 onClick={async () => {
                   console.log('🔧 Testing admin API access...');
                   const result = await adminService.testAdminAccess();
                   if (result.success) {
                     alert('✅ Test thành công! Bạn có quyền admin và API hoạt động bình thường.');
                   } else {
                     console.error('Test result:', result);
                     alert(`❌ Test thất bại!\nLỗi: ${result.error}\nStatus: ${result.status}\nXem console để biết thêm chi tiết.`);
                   }
                 }}
               >
                 Test Admin API
               </Button>
               
               <Text style={{ color: '#666', fontSize: '12px' }}>
                 Sử dụng các công cụ debug để kiểm tra quyền truy cập và kết nối API
               </Text>
                            </Space>
             </Card>
           )}
           
         <AdminDebugGuide />
       </div>
     );
   }

  const OverviewTab = () => (
    <div>
      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={safeGet(dashboardStats, 'revenue.total', 0)}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Hôm nay: {formatCurrency(safeGet(dashboardStats, 'revenue.today', 0))}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Đặt Bàn"
              value={safeGet(dashboardStats, 'overview.totalReservations', 0)}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Hôm nay: {safeGet(dashboardStats, 'overview.todayReservations', 0)}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Khách Hàng"
              value={safeGet(dashboardStats, 'overview.totalCustomers', 0)}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhân Viên Phục Vụ"
              value={safeGet(dashboardStats, 'overview.totalServants', 0)}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Biểu Đồ Doanh Thu Theo Thời Gian">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={safeArray(revenueStats?.revenueByPeriod)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Status Breakdown */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Trạng Thái Đặt Bàn">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={safeArray(dashboardStats?.breakdowns?.reservationsByStatus)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count, percent }) => `${_id || 'N/A'}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {safeArray(dashboardStats?.breakdowns?.reservationsByStatus).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Trạng Thái Đơn Hàng">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={safeArray(dashboardStats?.breakdowns?.tableOrdersByStatus)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count, percent }) => `${_id || 'N/A'}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="count"
                >
                  {safeArray(dashboardStats?.breakdowns?.tableOrdersByStatus).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const RevenueTab = () => (
    <div>
      {/* Top Tables and Foods */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Top Bàn Theo Doanh Thu">
            <Table
              dataSource={safeArray(revenueStats?.topTables)}
              pagination={false}
              size="small"
              rowKey="_id"
            >
              <Table.Column title="Bàn" dataKey="tableNumber" render={(text) => `Bàn ${text || 'N/A'}`} />
              <Table.Column
                title="Doanh Thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => safeGet(a, 'totalRevenue', 0) - safeGet(b, 'totalRevenue', 0)}
              />
              <Table.Column
                title="Số Đơn"
                dataKey="orderCount"
                render={(value) => formatNumber(value)}
                sorter={(a, b) => safeGet(a, 'orderCount', 0) - safeGet(b, 'orderCount', 0)}
              />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Món Ăn Theo Doanh Thu">
            <Table
              dataSource={safeArray(revenueStats?.topFoods)}
              pagination={false}
              size="small"
              rowKey="_id"
            >
              <Table.Column title="Món Ăn" dataKey="name" render={(text) => text || 'N/A'} />
              <Table.Column
                title="Doanh Thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => safeGet(a, 'totalRevenue', 0) - safeGet(b, 'totalRevenue', 0)}
              />
              <Table.Column
                title="Số Lượng"
                dataKey="totalQuantity"
                render={(value) => formatNumber(value)}
                sorter={(a, b) => safeGet(a, 'totalQuantity', 0) - safeGet(b, 'totalQuantity', 0)}
              />
            </Table>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Card title="Chi Tiết Doanh Thu">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={safeArray(revenueStats?.revenueByPeriod)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value, name) => [
                name === 'totalRevenue' ? formatCurrency(value) : formatNumber(value),
                name === 'totalRevenue' ? 'Doanh thu' : 
                name === 'orderCount' ? 'Số đơn' : 'Giá trị TB'
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#8884d8"
              strokeWidth={2}
              name="Doanh thu"
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Số đơn"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const ReservationTab = () => (
    <div>
      {/* Reservation Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Đặt Bàn Theo Ngày">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeArray(reservationStats?.reservationsByDate)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Tổng" />
                <Bar dataKey="confirmedCount" fill="#82ca9d" name="Đã xác nhận" />
                <Bar dataKey="completedCount" fill="#ffc658" name="Hoàn thành" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đặt Bàn Theo Giờ">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={safeArray(reservationStats?.reservationsByTimeSlot)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tickFormatter={(value) => `${value || 0}:00`} />
                <YAxis />
                <Tooltip labelFormatter={(value) => `${value || 0}:00`} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Most Booked Tables */}
      <Card title="Bàn Được Đặt Nhiều Nhất">
        <Table
          dataSource={safeArray(reservationStats?.mostBookedTables)}
          pagination={false}
          rowKey="_id"
        >
          <Table.Column
            title="Bàn"
            dataKey="tableNumber"
            render={(text) => `Bàn ${text || 'N/A'}`}
          />
          <Table.Column title="Sức chứa" dataKey="capacity" render={(value) => formatNumber(value)} />
          <Table.Column
            title="Số lần đặt"
            dataKey="bookingCount"
            sorter={(a, b) => safeGet(a, 'bookingCount', 0) - safeGet(b, 'bookingCount', 0)}
            render={(value) => (
              <Tag color="blue">{formatNumber(value)} lần</Tag>
            )}
          />
        </Table>
      </Card>
    </div>
  );

  const StaffTab = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hiệu Suất Nhân Viên">
            <Table
              dataSource={safeArray(staffStats?.staffPerformance)}
              pagination={false}
              rowKey="_id"
              size="small"
            >
              <Table.Column title="Tên" dataKey="servantName" render={(text) => text || 'N/A'} />
              <Table.Column
                title="Tổng đặt bàn"
                dataKey="totalReservations"
                render={(value) => formatNumber(value)}
                sorter={(a, b) => safeGet(a, 'totalReservations', 0) - safeGet(b, 'totalReservations', 0)}
              />
              <Table.Column
                title="Hoàn thành"
                dataKey="completedReservations"
                render={(value) => formatNumber(value)}
                sorter={(a, b) => safeGet(a, 'completedReservations', 0) - safeGet(b, 'completedReservations', 0)}
              />
              <Table.Column
                title="Tỷ lệ hoàn thành"
                dataKey="completionRate"
                render={(value) => {
                  const safeValue = safeGet({ completionRate: value }, 'completionRate', 0);
                  return (
                    <div>
                      <Progress
                        percent={Math.round(safeValue)}
                        size="small"
                        status={safeValue >= 80 ? 'success' : safeValue >= 60 ? 'normal' : 'exception'}
                      />
                    </div>
                  );
                }}
                sorter={(a, b) => safeGet(a, 'completionRate', 0) - safeGet(b, 'completionRate', 0)}
              />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Doanh Thu Theo Nhân Viên">
            <Table
              dataSource={safeArray(staffStats?.staffRevenue)}
              pagination={false}
              rowKey="_id"
              size="small"
            >
              <Table.Column title="Tên" dataKey="servantName" render={(text) => text || 'N/A'} />
              <Table.Column
                title="Tổng doanh thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => safeGet(a, 'totalRevenue', 0) - safeGet(b, 'totalRevenue', 0)}
              />
              <Table.Column
                title="Số đặt bàn"
                dataKey="reservationCount"
                render={(value) => formatNumber(value)}
                sorter={(a, b) => safeGet(a, 'reservationCount', 0) - safeGet(b, 'reservationCount', 0)}
              />
              <Table.Column
                title="TB/Đặt bàn"
                dataKey="averageRevenuePerReservation"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => safeGet(a, 'averageRevenuePerReservation', 0) - safeGet(b, 'averageRevenuePerReservation', 0)}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const CustomerTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Khách Hàng VIP (Top 10)">
            <List
              dataSource={safeArray(customerStats?.topCustomers).slice(0, 10)}
              renderItem={(customer, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: index < 3 ? '#f56a00' : '#1890ff'
                        }}
                        icon={index < 3 ? <CrownOutlined /> : <UserOutlined />}
                      />
                    }
                    title={customer?.customerName || 'N/A'}
                    description={
                      <div>
                        <div>Email: {customer?.customerEmail || 'N/A'}</div>
                        <div>SĐT: {customer?.customerPhone || 'N/A'}</div>
                        <div>
                          <Tag color="green">
                            {formatNumber(safeGet(customer, 'totalReservations', 0))} đặt bàn
                          </Tag>
                          <Tag color="blue">
                            {formatCurrency(safeGet(customer, 'totalRevenue', 0))}
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Khách Hàng Mới Theo Ngày">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeArray(customerStats?.newCustomers)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Customer Retention */}
      <Card title="Độ Trung Thành Khách Hàng">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={safeArray(customerStats?.customerRetention)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              tickFormatter={(value) => `${value || 0} lần`}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => `${value || 0} lần đặt bàn`}
              formatter={(value) => [formatNumber(value), 'Số khách hàng']}
            />
            <Bar dataKey="customerCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  return (
    <div className="admin-statistics">
      <div className="admin-statistics-header">
        <Title level={2}>Thống Kê Hệ Thống Nhà Hàng</Title>
        
        <div className="admin-statistics-controls">
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
          >
            <Option value="week">Tuần</Option>
            <Option value="month">Tháng</Option>
            <Option value="year">Năm</Option>
          </Select>
          
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tổng Quan" key="overview">
          <OverviewTab />
        </TabPane>
        {/* <TabPane tab="Doanh Thu" key="revenue">
          <RevenueTab />
        </TabPane>
        <TabPane tab="Đặt Bàn" key="reservations">
          <ReservationTab />
        </TabPane>
        <TabPane tab="Nhân Viên" key="staff">
          <StaffTab />
        </TabPane>
        <TabPane tab="Khách Hàng" key="customers">
          <CustomerTab />
        </TabPane> */}
      </Tabs>
    </div>
  );
};

export default AdminStatistics; 