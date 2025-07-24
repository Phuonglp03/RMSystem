import React, { useState, useEffect } from 'react';
import { Menu, Button, Typography, Dropdown, Space, Table } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    HomeOutlined,
    MenuOutlined,
    LoginOutlined,
    SettingOutlined,
    GiftOutlined,
    BarChartOutlined,
    DownOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    TableOutlined,
    PercentageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { MainLogo } from './Logo';
const { Title } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
            onClick: () => navigate('/profile')
        }
    ];

    const menuItems = [
        {
            key: '1',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
            onClick: () => navigate('/')
        },
        {
            key: '2',
            icon: <MenuOutlined />,
            label: 'Thực đơn',
            onClick: () => navigate('/menu')
        },
        {
            key: 'voucher',
            icon: <PercentageOutlined />,
            label: 'Ưu đãi',
            onClick: () => navigate('/vouchers')
        },
        {
            key: '3',
            icon: <CalendarOutlined />,
            label: 'Đặt món ăn',
            onClick: () => navigate('/booking-food/table-order')
        },
        {
            key: 'booking',
            icon: <GiftOutlined />,
            label: 'Đặt bàn',
            onClick: () => navigate('/book-table')
        },
        {
            key: '4',
            icon: <SettingOutlined />,
            label: 'Quản lý đặt bàn',
            onClick: () => navigate('/servant/manage-reservation')
        },
        {
            key: 'foodlistmanage',
            icon: <AppstoreOutlined />,
            label: 'Quản lý đơn đặt món',
            onClick: () => navigate('/servant/manage-order')
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Tài khoản',
            onClick: () => navigate('/profile')
        },
        {
            key: '7',
            icon: <TableOutlined />,
            label: 'Lịch sử đặt đơn',
            onClick: () => navigate('/order-history')
        }
    ];

    return (
        <header style={{
            position: 'fixed',
            zIndex: 2,
            width: '100%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 40px'
        }}>
            <MainLogo />
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['1']}
                items={menuItems}
                style={{
                    border: 'none',
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center' }}>
                {!isAuthenticated ? (
                    // Hiển thị khi chưa đăng nhập
                    <>
                        <Button
                            onClick={() => navigate('/signup')}
                            style={{ marginRight: 16 }}
                        >
                            Đăng ký
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => navigate('/login')}
                            style={{ marginRight: 16 }}
                        >
                            Đăng nhập
                        </Button>
                    </>
                ) : (
                    // Hiển thị khi đã đăng nhập
                    <>
                        <span style={{ marginRight: 16 }}>
                            Xin chào, {user?.username || user?.fullname || 'User'}!
                        </span>
                        <Button
                            onClick={handleLogout}
                            style={{ marginRight: 16 }}
                            icon={<LoginOutlined />}
                        >
                            Đăng xuất
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;