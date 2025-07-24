import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TableOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';

const { Sider, Content } = Layout;
const { Text } = Typography;

const ChefLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/chef/orders',
      icon: <TableOutlined />,
      label: 'Đơn chế biến',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <div className="chef-layout">
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', padding: '8px 12px 0 0' }}>
            <span onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', color: '#fff', fontSize: 18 }}>
              {collapsed ? '<' : '>'}
            </span>
          </div>
          <div style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: collapsed ? '14px' : '16px'
          }}>
            {collapsed ? 'CF' : 'Chef'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
          {/* Header */}
          <div style={{
            height: 64,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') handleLogout();
                },
              }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{user?.fullname || user?.username || 'Chef'}</Text>
              </Space>
            </Dropdown>
          </div>
          <Content style={{ marginTop: 64, minHeight: 'calc(100vh - 64px)', background: '#f4f6fb', borderRadius: 12, margin: '24px 16px', padding: 24 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default ChefLayout; 