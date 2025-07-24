import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TableOutlined, CalendarOutlined, ShoppingCartOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Sider, Content } = Layout;

const ServantLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/servant/tables',
      icon: <TableOutlined />,
      label: 'Quản lý bàn',
    },
    {
      key: '/servant/reservations',
      icon: <CalendarOutlined />,
      label: 'Quản lý đơn đặt bàn',
    },
    {
      key: '/servant/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý đơn đặt món',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <div className="servant-layout">
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
          {/* Nút thu/phóng sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', padding: '8px 12px 0 0' }}>
            <span onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', color: '#fff', fontSize: 18 }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
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
            {collapsed ? 'SV' : 'Servant'}
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
          <Content style={{ marginTop: 126, minHeight: 'calc(100vh - 64px - 100px)', background: colorBgContainer, borderRadius: borderRadiusLG, margin: '24px 16px', padding: 24 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default ServantLayout;
