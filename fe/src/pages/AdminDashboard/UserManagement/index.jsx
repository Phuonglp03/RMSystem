import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Empty,
  Spin
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import userService from '../../../services/user.service';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    status: ''
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        role: filters.role,
        search: filters.search,
        status: filters.status
      };

      const response = await userService.getAllStaff(params);
      
      if (response && response.data) {
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.totalItems || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    setModalVisible(true);
    
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
        active: user.active
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ active: true });
    }
  };

  const showDetailModal = (user) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setEditingUser(null);
    setSelectedUser(null);
    form.resetFields();
    setSubmitting(false);
  };

  const handleSubmit = async (values) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      const userData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
      };

      if (editingUser) {
        await userService.updateStaffAccount(editingUser._id, userData);
        message.success('Cập nhật tài khoản thành công!');
      } else {
        await userService.createStaffAccount(userData);
        message.success('Tạo tài khoản mới thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await userService.deactivateStaffAccount(userId);
        message.success('Vô hiệu hóa tài khoản thành công!');
      } else {
        await userService.activateStaffAccount(userId);
        message.success('Kích hoạt tài khoản thành công!');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      await userService.resetStaffPassword(userId, newPassword);
      message.success(`Đặt lại mật khẩu thành công! Mật khẩu mới: ${newPassword}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      chef: 'orange',
      servant: 'blue',
      customer: 'green'
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <CrownOutlined />,
      chef: <TeamOutlined />,
      servant: <UserOutlined />,
      customer: <UserOutlined />
    };
    return icons[role] || <UserOutlined />;
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (_, record) => (
        <Avatar 
          size="large" 
          icon={<UserOutlined />}
          src={record.avatar}
          style={{ backgroundColor: '#87d068' }}
        />
      )
    },
    {
      title: 'Thông tin',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.fullname }</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.email}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.username}
          </Text>
          {record.phone && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {record.phone}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active, record) => (
        <Space direction="vertical" size="small">
          <Badge 
            status={active ? "success" : "error"}
            text={active ? "Hoạt động" : "Vô hiệu hóa"}
          />
          {record.verified && (
            <Tag color="green" size="small">
              <CheckCircleOutlined /> Đã xác thực
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {moment(date).format('DD/MM/YYYY')}
        </Text>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Popconfirm
              title="Bạn có chắc chắn muốn đặt lại mật khẩu?"
              onConfirm={() => handleResetPassword(record._id)}
            >
              <Button type="text" icon={<LockOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title={record.active ? "Vô hiệu hóa" : "Kích hoạt"}>
            <Popconfirm
              title={`Bạn có chắc chắn muốn ${record.active ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản này?`}
              onConfirm={() => handleToggleStatus(record._id, record.active)}
            >
              <Button 
                type="text" 
                icon={record.active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                danger={record.active}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Quản lý tài khoản
        </Title>
      </div>

      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên, email..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Vai trò"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('role', value)}
              allowClear
            >
              <Option value="admin">Admin</Option>
              <Option value="chef">Chef</Option>
              <Option value="servant">Servant</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Vô hiệu hóa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Tạo tài khoản mới
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullname"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="admin">Admin</Option>
                  <Option value="chef">Chef</Option>
                  <Option value="servant">Servant</Option>
                  <Option value="customer">Customer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="active"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu hóa" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết tài khoản"
        open={detailModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        {selectedUser && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: 8 }}>
                {selectedUser.fullname || selectedUser.username}
              </Title>
              <Tag color={getRoleColor(selectedUser.role)} icon={getRoleIcon(selectedUser.role)}>
                {selectedUser.role?.toUpperCase()}
              </Tag>
            </div>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Email:</Text></Col>
              <Col span={16}><Text>{selectedUser.email}</Text></Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Tên đăng nhập:</Text></Col>
              <Col span={16}><Text>{selectedUser.username}</Text></Col>
            </Row>
            
            {selectedUser.phone && (
              <Row gutter={16}>
                <Col span={8}><Text strong>Số điện thoại:</Text></Col>
                <Col span={16}><Text>{selectedUser.phone}</Text></Col>
              </Row>
            )}
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Giới tính:</Text></Col>
              <Col span={16}><Text>{selectedUser.gender || 'Chưa cập nhật'}</Text></Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Ngày sinh:</Text></Col>
              <Col span={16}><Text>{selectedUser.dateOfBirth ? moment(selectedUser.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Text></Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Trạng thái:</Text></Col>
              <Col span={16}>
                <Badge 
                  status={selectedUser.active ? "success" : "error"}
                  text={selectedUser.active ? "Hoạt động" : "Vô hiệu hóa"}
                />
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Xác thực:</Text></Col>
              <Col span={16}>
                <Tag color={selectedUser.verified ? "green" : "red"}>
                  {selectedUser.verified ? "Đã xác thực" : "Chưa xác thực"}
                </Tag>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}><Text strong>Ngày tạo:</Text></Col>
              <Col span={16}><Text>{moment(selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}</Text></Col>
            </Row>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement; 