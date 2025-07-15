import React, { useEffect, useState } from 'react';
import { List, Card, Tag, Typography, Spin, Space, Popconfirm, Button } from 'antd';
import { BellOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import notificationService from '../../services/notification.service';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './index.css';

const { Text } = Typography;

const typeLabel = {
    RESERVATION_CREATED_BY_CUSTOMER: 'Khách đặt bàn',
    RESERVATION_CONFIRMED_BY_SERVANT: 'Đã xác nhận',
    RESERVATION_REJECTED_BY_SERVANT: 'Bị từ chối',
    RESERVATION_CREATED_BY_SERVANT: 'Tạo mới',
    RESERVATION_DELETED_BY_SERVANT: 'Đã xóa',
    RESERVATION_UPDATED_BY_SERVANT: 'Cập nhật',
};

const typeColor = {
    RESERVATION_CREATED_BY_CUSTOMER: 'blue',
    RESERVATION_CONFIRMED_BY_SERVANT: 'green',
    RESERVATION_REJECTED_BY_SERVANT: 'red',
    RESERVATION_CREATED_BY_SERVANT: 'purple',
    RESERVATION_DELETED_BY_SERVANT: 'orange',
    RESERVATION_UPDATED_BY_SERVANT: 'gold',
};

const Reservation_Notification = () => {
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
        console.log('Notification clicked:', item);
        if (!item.isRead) {
            await handleMarkAsRead(item.id, false);
        }
        if (item.relatedEntityId) {
            navigate(`/servant/reservation-detail/${item.relatedEntityId}`);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '30px auto', padding: '20px' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Card title={<><BellOutlined /> Thông báo</>}>
                {loading ? (
                    <Spin tip="Đang tải..." style={{ width: '100%' }} />
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Không có thông báo nào
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={notifications}
                        renderItem={item => (
                            <List.Item
                                style={{
                                    background: item.isRead ? '#f5f5f5' : '#fff',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 8,
                                    padding: '12px 16px',
                                    marginTop: 12,
                                    marginBottom: 12,
                                    cursor: 'pointer',
                                    opacity: item.isRead ? 0.8 : 1,
                                    transition: 'background 0.2s'
                                }}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Space wrap>
                                        <Tag color={typeColor[item.type] || 'default'}>
                                            {typeLabel[item.type] || 'Thông báo'}
                                        </Tag>
                                        <Text strong>{item.title}</Text>
                                    </Space>
                                    <Text type="secondary">{item.message}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                                    </Text>
                                    <Space style={{ marginTop: 8 }}>
                                        {!item.isRead && (
                                            <Tag icon={<CheckCircleOutlined />} color="processing">
                                                Chưa đọc
                                            </Tag>
                                        )}
                                        <Popconfirm
                                            title="Xóa thông báo?"
                                            onConfirm={() => handleDelete(item.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={deletingId === item.id}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </Space>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default Reservation_Notification;
