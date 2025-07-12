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
    TableOutlined
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

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                Hồ sơ
            </Menu.Item>

        </Menu>
    );

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
                style={{
                    border: 'none',
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/')}>Trang chủ</Menu.Item>


                <Menu.Item key="2" icon={<MenuOutlined />} onClick={() => navigate('/menu')}>
                    Thực đơn
                </Menu.Item>

                <Menu.Item key="3" icon={<CalendarOutlined />} onClick={() => navigate('/test-table-order')}>
                    Đặt món ăn
                </Menu.Item>
                <Menu.Item key="vouchers" icon={<GiftOutlined />} onClick={() => navigate('/book-table')}>
                    Đặt bàn
                </Menu.Item>

{/* 
                <Menu.Item key="foodmanager" icon={<AppstoreOutlined />} onClick={() => navigate('/')}>
                    Quản lý món ăn
                </Menu.Item>

                <Menu.Item key="vouchermanager" icon={<AppstoreOutlined />} onClick={() => navigate('/')}>
                    Quản lý Voucher
                </Menu.Item>


                <Menu.Item key="orderconfirmation" icon={<CheckCircleOutlined />} onClick={() => navigate('/')}>
                    Xác nhận món ăn
                </Menu.Item> */}

                <Menu.Item key="4" icon={<SettingOutlined />} onClick={() => navigate('/servant/manage-reservation')}>
                    Quản lý đặt bàn
                </Menu.Item>

                <Menu.Item key="5" icon={<BarChartOutlined />} onClick={() => navigate('/')}>
                    Thống kê
                </Menu.Item>

                <Menu.Item key="foodlistmanage" icon={<AppstoreOutlined />} onClick={() => navigate('/')}>
                    Quản lý món ăn
                </Menu.Item>

                <Menu.Item key="6" icon={<UserOutlined />} onClick={() => navigate('/coupon-exchange')}>
                    Đổi voucher
                </Menu.Item>
                <Menu.Item key="6" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                    Tài khoản

                </Menu.Item>
                <Menu.Item key="7" icon={<TableOutlined />} onClick={() => navigate('/order-history')}>
                    Lịch sử đặt đơn
                </Menu.Item>

            </Menu>

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