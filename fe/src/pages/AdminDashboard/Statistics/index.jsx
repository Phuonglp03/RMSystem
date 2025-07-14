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
  Avatar
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

  useEffect(() => {
    loadAllStats();
  }, [period, dateRange]);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        period,
        ...(dateRange && {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        })
      };

      const [dashboard, revenue, reservations, staff, customers] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueStats(params),
        adminService.getReservationStats(params),
        adminService.getStaffStats(params),
        adminService.getCustomerStats(params)
      ]);

      setDashboardStats(dashboard.data);
      setRevenueStats(revenue.data);
      setReservationStats(reservations.data);
      setStaffStats(staff.data);
      setCustomerStats(customers.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Đang tải dữ liệu thống kê...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
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
              value={dashboardStats?.revenue?.total || 0}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Hôm nay: {formatCurrency(dashboardStats?.revenue?.today || 0)}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Đặt Bàn"
              value={dashboardStats?.overview?.totalReservations || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Hôm nay: {dashboardStats?.overview?.todayReservations || 0}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Khách Hàng"
              value={dashboardStats?.overview?.totalCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhân Viên Phục Vụ"
              value={dashboardStats?.overview?.totalServants || 0}
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
              <AreaChart data={revenueStats?.revenueByPeriod || []}>
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
                  data={dashboardStats?.breakdowns?.reservationsByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(dashboardStats?.breakdowns?.reservationsByStatus || []).map((entry, index) => (
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
                  data={dashboardStats?.breakdowns?.tableOrdersByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="count"
                >
                  {(dashboardStats?.breakdowns?.tableOrdersByStatus || []).map((entry, index) => (
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
              dataSource={revenueStats?.topTables || []}
              pagination={false}
              size="small"
              rowKey="_id"
            >
              <Table.Column title="Bàn" dataKey="tableNumber" render={(text) => `Bàn ${text}`} />
              <Table.Column
                title="Doanh Thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => a.totalRevenue - b.totalRevenue}
              />
              <Table.Column
                title="Số Đơn"
                dataKey="orderCount"
                sorter={(a, b) => a.orderCount - b.orderCount}
              />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Món Ăn Theo Doanh Thu">
            <Table
              dataSource={revenueStats?.topFoods || []}
              pagination={false}
              size="small"
              rowKey="_id"
            >
              <Table.Column title="Món Ăn" dataKey="name" />
              <Table.Column
                title="Doanh Thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => a.totalRevenue - b.totalRevenue}
              />
              <Table.Column
                title="Số Lượng"
                dataKey="totalQuantity"
                sorter={(a, b) => a.totalQuantity - b.totalQuantity}
              />
            </Table>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Card title="Chi Tiết Doanh Thu">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueStats?.revenueByPeriod || []}>
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
              <BarChart data={reservationStats?.reservationsByDate || []}>
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
              <AreaChart data={reservationStats?.reservationsByTimeSlot || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tickFormatter={(value) => `${value}:00`} />
                <YAxis />
                <Tooltip labelFormatter={(value) => `${value}:00`} />
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
          dataSource={reservationStats?.mostBookedTables || []}
          pagination={false}
          rowKey="_id"
        >
          <Table.Column
            title="Bàn"
            dataKey="tableNumber"
            render={(text) => `Bàn ${text}`}
          />
          <Table.Column title="Sức chứa" dataKey="capacity" />
          <Table.Column
            title="Số lần đặt"
            dataKey="bookingCount"
            sorter={(a, b) => a.bookingCount - b.bookingCount}
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
              dataSource={staffStats?.staffPerformance || []}
              pagination={false}
              rowKey="_id"
              size="small"
            >
              <Table.Column title="Tên" dataKey="servantName" />
              <Table.Column
                title="Tổng đặt bàn"
                dataKey="totalReservations"
                sorter={(a, b) => a.totalReservations - b.totalReservations}
              />
              <Table.Column
                title="Hoàn thành"
                dataKey="completedReservations"
                sorter={(a, b) => a.completedReservations - b.completedReservations}
              />
              <Table.Column
                title="Tỷ lệ hoàn thành"
                dataKey="completionRate"
                render={(value) => (
                  <div>
                    <Progress
                      percent={Math.round(value)}
                      size="small"
                      status={value >= 80 ? 'success' : value >= 60 ? 'normal' : 'exception'}
                    />
                  </div>
                )}
                sorter={(a, b) => a.completionRate - b.completionRate}
              />
            </Table>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Doanh Thu Theo Nhân Viên">
            <Table
              dataSource={staffStats?.staffRevenue || []}
              pagination={false}
              rowKey="_id"
              size="small"
            >
              <Table.Column title="Tên" dataKey="servantName" />
              <Table.Column
                title="Tổng doanh thu"
                dataKey="totalRevenue"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => a.totalRevenue - b.totalRevenue}
              />
              <Table.Column
                title="Số đặt bàn"
                dataKey="reservationCount"
                sorter={(a, b) => a.reservationCount - b.reservationCount}
              />
              <Table.Column
                title="TB/Đặt bàn"
                dataKey="averageRevenuePerReservation"
                render={(value) => formatCurrency(value)}
                sorter={(a, b) => a.averageRevenuePerReservation - b.averageRevenuePerReservation}
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
              dataSource={customerStats?.topCustomers?.slice(0, 10) || []}
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
                    title={customer.customerName}
                    description={
                      <div>
                        <div>Email: {customer.customerEmail}</div>
                        <div>SĐT: {customer.customerPhone}</div>
                        <div>
                          <Tag color="green">
                            {formatNumber(customer.totalReservations)} đặt bàn
                          </Tag>
                          <Tag color="blue">
                            {formatCurrency(customer.totalRevenue)}
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
              <LineChart data={customerStats?.newCustomers || []}>
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
          <BarChart data={customerStats?.customerRetention || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              tickFormatter={(value) => `${value} lần`}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => `${value} lần đặt bàn`}
              formatter={(value) => [formatNumber(value), 'Số khách hàng']}
            />
            <Bar dataKey="customerCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Thống Kê Hệ Thống Nhà Hàng</Title>
        
        <Space size="large" style={{ marginBottom: '16px' }}>
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
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tổng Quan" key="overview">
          <OverviewTab />
        </TabPane>
        <TabPane tab="Doanh Thu" key="revenue">
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
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminStatistics; 