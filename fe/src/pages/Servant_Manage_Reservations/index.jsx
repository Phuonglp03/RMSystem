import React from 'react'
import './index.css'
import { useNavigate } from 'react-router-dom'

const Servant_Manage_Reservation = () => {
    const navigate = useNavigate()
    const navigationItems = [
        {
            title: 'Lịch Sử Đặt Bàn',
            description: 'Xem lịch sử tất cả đơn đặt bàn',
            icon: '📋',
            path: '/servant/reservation-history',
            colorClass: 'nav-card-blue'
        },
        {
            title: 'Thông Báo Đặt Bàn',
            description: 'Xem thông báo đặt bàn mới',
            icon: '🔔',
            path: '/servant/reservation-notification',
            colorClass: 'nav-card-orange'
        },
        {
            title: 'Bàn đã nhận',
            description: 'Xem danh sách bàn đã nhận từ những đơn đặt bàn trước',
            icon: '✅',
            path: '/servant/assigned-tables',
            colorClass: 'nav-card-green'
        },
        {
            title: 'Tạo đơn đặt bàn',
            description: 'Tạo đơn đặt bàn mới cho khách',
            icon: '🔄',
            path: '/servant/reservation-create',
            colorClass: 'nav-card-yellow'
        },
        {
            title: 'Xác Nhận Khách Đến',
            description: 'Xác nhận khách đã đến/chưa đến',
            icon: '👥',
            path: '/servant/confirm-guest-arrive',
            colorClass: 'nav-card-purple'
        },
        {
            title: 'Thống Kê Cá Nhân',
            description: 'Xem thống kê đơn đặt bàn của từng người',
            icon: '📊',
            path: '/servant/reservation-statistics',
            colorClass: 'nav-card-indigo'
        }
    ]

    const handleNavigation = (path) => {

        console.log('Navigating to:', path)

        navigate(path)
    }

    return (
        <div className="reservation-container">
            <div className="reservation-wrapper">
                {/* Header */}
                <div className="reservation-header">
                    <h1 className="reservation-title">
                        Quản Lý Đặt Bàn
                    </h1>
                    <p className="reservation-subtitle">
                        Chọn chức năng quản lý đặt bàn nhà hàng
                    </p>
                </div>

                {/* Navigation Grid */}
                <div className="nav-grid">
                    {navigationItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className={`nav-card ${item.colorClass}`}
                        >
                            <div className="nav-card-content">
                                {/* Icon */}
                                <div className="nav-icon-container">
                                    <div className="nav-icon">
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="nav-text">
                                    <h3 className="nav-title">
                                        {item.title}
                                    </h3>
                                    <p className="nav-description">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom accent */}
                            <div className="nav-accent"></div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                {/* <div className="stats-container">
                    <h2 className="stats-title">
                        Thống Kê Nhanh
                    </h2>
                    <div className="stats-grid">
                        <div className="stat-item stat-blue">
                            <div className="stat-number">18</div>
                            <div className="stat-label">Đặt bàn hôm nay</div>
                        </div>
                        <div className="stat-item stat-green">
                            <div className="stat-number">89</div>
                            <div className="stat-label">Tổng đặt bàn</div>
                        </div>
                        <div className="stat-item stat-yellow">
                            <div className="stat-number">5</div>
                            <div className="stat-label">Chờ xác nhận</div>
                        </div>
                        <div className="stat-item stat-red">
                            <div className="stat-number">2</div>
                            <div className="stat-label">Khách chưa đến</div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Servant_Manage_Reservation