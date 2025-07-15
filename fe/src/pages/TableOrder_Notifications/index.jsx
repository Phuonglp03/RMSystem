import React, { useEffect, useState } from 'react';
import tableOrderNotificationService from '../../services/tableOrderNotification.service';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';
import { useNavigate } from 'react-router-dom';

const typeLabel = {
    TABLE_ORDER_CREATED: 'Đặt món mới',
    TABLE_ORDER_UPDATED: 'Cập nhật món',
    TABLE_ORDER_CANCELLED: 'Hủy món',
    TABLE_ORDER_CREATED_BY_SERVANT: 'Tạo mới',
    TABLE_ORDER_UPDATED_BY_SERVANT: 'Cập nhật',
    // Thêm các loại khác nếu có
};

const typeColor = {
    TABLE_ORDER_CREATED: '#1890ff',
    TABLE_ORDER_UPDATED: '#faad14',
    TABLE_ORDER_CANCELLED: '#ff4d4f',
    TABLE_ORDER_CREATED_BY_SERVANT: '#1890ff',
    TABLE_ORDER_UPDATED_BY_SERVANT: '#faad14',
    // Thêm các màu khác nếu có
};

const TableOrder_Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await tableOrderNotificationService.getNotifications();
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
            await tableOrderNotificationService.markNotificationAsRead(id);
            setRefresh(r => !r);
        } catch (err) {
            toast.error('Lỗi khi đánh dấu đã đọc');
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await tableOrderNotificationService.deleteNotification(id);
            toast.success('Đã xóa thông báo');
            setRefresh(r => !r);
        } catch (err) {
            toast.error('Lỗi khi xóa thông báo');
        } finally {
            setDeletingId(null);
        }
    };

    const handleNotificationClick = async (item) => {
        if (!item.isRead) {
            await handleMarkAsRead(item.id, false);
        }
        if (item.relatedEntityId) {
            navigate(`/servant/table-order-detail/${item.relatedEntityId}`);
        }
    };

    return (
        <div className="noti-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="noti-title">
                <span className="noti-bell" role="img" aria-label="bell">🔔</span> Thông báo Đặt món
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
                            onClick={() => handleNotificationClick(item)}
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

export default TableOrder_Notifications;
