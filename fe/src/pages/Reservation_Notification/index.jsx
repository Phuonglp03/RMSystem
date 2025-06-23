import React, { useEffect, useState } from 'react';
import notificationService from '../../services/notification.service';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';

const typeLabel = {
    RESERVATION_CREATED_BY_CUSTOMER: 'Khách đặt bàn',
    RESERVATION_CONFIRMED_BY_SERVANT: 'Đã xác nhận',
    RESERVATION_REJECTED_BY_SERVANT: 'Bị từ chối',
    RESERVATION_CREATED_BY_SERVANT: 'Tạo mới',
    RESERVATION_DELETED_BY_SERVANT: 'Đã xóa',
    RESERVATION_UPDATED_BY_SERVANT: 'Cập nhật',
};

const typeColor = {
    RESERVATION_CREATED_BY_CUSTOMER: '#1890ff',
    RESERVATION_CONFIRMED_BY_SERVANT: '#52c41a',
    RESERVATION_REJECTED_BY_SERVANT: '#ff4d4f',
    RESERVATION_CREATED_BY_SERVANT: '#722ed1',
    RESERVATION_DELETED_BY_SERVANT: '#fa8c16',
    RESERVATION_UPDATED_BY_SERVANT: '#faad14',
};

const Reservation_Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await notificationService.getNotifications();
                setNotifications(res.notifications || []);
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
        } catch (err) {
            toast.error('Lỗi khi đánh dấu đã đọc');
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await notificationService.deleteNotification(id);
            toast.success('Đã xóa thông báo');
            setRefresh(r => !r);
        } catch (err) {
            toast.error('Lỗi khi xóa thông báo');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="noti-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="noti-title">
                <span className="noti-bell" role="img" aria-label="bell">🔔</span> Thông báo
            </div>
            {loading ? (
                <div className="noti-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
                <div className="noti-empty">Không có thông báo nào</div>
            ) : (
                <div className="noti-list">
                    {notifications.map(item => (
                        <div
                            key={item.id}
                            className={`noti-item${item.isRead ? ' read' : ''}`}
                            onClick={() => handleMarkAsRead(item.id, item.isRead)}
                        >
                            <div className="noti-icon">
                                <span role="img" aria-label="bell">🔔</span>
                            </div>
                            <div className="noti-content">
                                <div className="noti-row">
                                    <span
                                        className="noti-type"
                                        style={{ background: typeColor[item.type] || '#d9d9d9' }}
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
                                onClick={e => { e.stopPropagation(); if (window.confirm('Bạn chắc chắn muốn xóa thông báo này?')) handleDelete(item.id); }}
                                disabled={deletingId === item.id}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reservation_Notification;
