import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './index.css';
import notificationService from '../../services/notification.service';
import { BellOutlined, DeleteOutlined } from '@ant-design/icons';

const typeLabel = {
    TABLE_ORDER_CREATED: 'Đặt món mới',
    TABLE_ORDER_UPDATED: 'Cập nhật món',
    TABLE_ORDER_CANCELLED: 'Hủy món',
    TABLE_ORDER_CREATED_BY_SERVANT: 'Tạo món mới',
    TABLE_ORDER_UPDATED_BY_SERVANT: 'Cập nhật món',
    RESERVATION_CREATED_BY_CUSTOMER: 'Khách đặt bàn',
    RESERVATION_CONFIRMED_BY_SERVANT: 'Đã xác nhận',
    RESERVATION_REJECTED_BY_SERVANT: 'Bị từ chối',
    RESERVATION_CREATED_BY_SERVANT: 'Tạo đặt bàn',
    RESERVATION_DELETED_BY_SERVANT: 'Đã xóa',
    RESERVATION_UPDATED_BY_SERVANT: 'Cập nhật đặt bàn',
};

const typeColor = {
    TABLE_ORDER_CREATED: '#1890ff',
    TABLE_ORDER_UPDATED: '#1890ff',
    TABLE_ORDER_CANCELLED: '#ff7875',
    TABLE_ORDER_CREATED_BY_SERVANT: '#1890ff',
    TABLE_ORDER_UPDATED_BY_SERVANT: '#1890ff',
    RESERVATION_CREATED_BY_CUSTOMER: '#52c41a',
    RESERVATION_CONFIRMED_BY_SERVANT: '#52c41a',
    RESERVATION_REJECTED_BY_SERVANT: '#ff7875',
    RESERVATION_CREATED_BY_SERVANT: '#722ed1',
    RESERVATION_DELETED_BY_SERVANT: '#faad14',
    RESERVATION_UPDATED_BY_SERVANT: '#faad14',
};

const Servant_Notification_Page = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await notificationService.getNotifications();
                console.log('Fetched notifications:', res);
                setNotifications((res.notifications || []).sort());
            } catch (err) {
                toast.error('Lỗi khi tải thông báo: ' + (err?.message || err));
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [refresh]);

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            await notificationService.markNotificationAsRead(id);
            setRefresh(r => !r);
        } catch {
            toast.error('Lỗi khi đánh dấu đã đọc');
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await notificationService.deleteNotification(id);
            toast.success('Đã xóa thông báo');
            setRefresh(r => !r);
        } catch {
            toast.error('Lỗi khi xóa thông báo');
        } finally {
            setDeletingId(null);
        }
    };

    const handleNotificationClick = async (item) => {
        if (!item.isRead) {
            await handleMarkAsRead(item.id, item.isRead);
        }

        if (item.relatedEntityId) {
            const isReservation = item.type.startsWith('RESERVATION_');
            if (isReservation) {
                navigate(`/servant/reservation-detail/${item.relatedEntityId}`);
            } else {
                navigate(`/servant/table-order-detail/${item.relatedEntityId}`);
            }
        }
    };

    return (
        <div className="noti-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="noti-title">
                <BellOutlined className="noti-bell" /> Tất cả Thông báo
            </div>
            {loading ? (
                <div className="noti-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
                <div className="noti-empty">Không có thông báo nào</div>
            ) : (
                <div className="noti-list">
                    {notifications.map(item => {
                        const isReservation = item.type.startsWith('RESERVATION_');
                        return (
                            <div
                                key={item.id}
                                className={`noti-item${item.isRead ? ' read' : ''}`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="noti-icon">
                                    <BellOutlined />
                                </div>
                                <div className="noti-content">
                                    <div className="noti-row">
                                        <span
                                            className="noti-type"
                                            style={{ background: typeColor[item.type] || '#bfbfbf' }}
                                        >
                                            {typeLabel[item.type] || 'Thông báo'}
                                        </span>
                                        <span className="noti-title-text">{item.title}</span>
                                    </div>
                                    <div className="noti-message">{item.message}</div>
                                    <div className="noti-time">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                                </div>
                                <button
                                    className="noti-delete"
                                    title="Xóa thông báo"
                                    onClick={e => {
                                        e.stopPropagation();
                                        if (window.confirm('Bạn chắc chắn muốn xóa thông báo này?'))
                                            handleDelete(item.id);
                                    }}
                                    disabled={deletingId === item.id}
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Servant_Notification_Page;
