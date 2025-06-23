import React, { useEffect, useState } from 'react';
import { List, Typography, Button, Tag, Spin, message, Space, Popconfirm } from 'antd';
import notificationService from '../../services/notification.service';
import './index.css';

const { Title, Text } = Typography;

const Reservation_Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await notificationService.getNotifications();
                setNotifications(res.notifications || []);
            } catch (err) {
                message.error('Lỗi khi tải thông báo');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [refresh]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markNotificationAsRead(id);
            message.success('Đã đánh dấu là đã đọc');
            setRefresh(r => !r);
        } catch (err) {
            message.error('Lỗi khi đánh dấu đã đọc');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            message.success('Đã xóa thông báo');
            setRefresh(r => !r);
        } catch (err) {
            message.error('Lỗi khi xóa thông báo');
        }
    };

    const renderTypeTag = (type) => {
        switch (type) {
            case 'RESERVATION_CREATED_BY_CUSTOMER':
                return <Tag color="blue">Khách đặt bàn</Tag>;
            case 'RESERVATION_CONFIRMED_BY_SERVANT':
                return <Tag color="green">Đã xác nhận</Tag>;
            case 'RESERVATION_REJECTED_BY_SERVANT':
                return <Tag color="red">Bị từ chối</Tag>;
            case 'RESERVATION_CREATED_BY_SERVANT':
                return <Tag color="purple">Tạo mới</Tag>;
            case 'RESERVATION_DELETED_BY_SERVANT':
                return <Tag color="orange">Đã xóa</Tag>;
            case 'RESERVATION_UPDATED_BY_SERVANT':
                return <Tag color="gold">Cập nhật</Tag>;
            default:
                return <Tag color="default">Khác</Tag>;
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '24px 8px' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Thông báo đặt bàn</Title>
            {loading ? (
                <Spin style={{ display: 'block', margin: '40px auto' }} />
            ) : (
                <List
                    itemLayout="vertical"
                    dataSource={notifications}
                    locale={{ emptyText: 'Không có thông báo nào' }}
                    renderItem={item => (
                        <List.Item
                            key={item.id}
                            style={{ background: item.isRead ? '#f5f5f5' : '#e6f7ff', marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}
                            actions={[
                                !item.isRead && <Button size="small" onClick={() => handleMarkAsRead(item.id)}>Đánh dấu đã đọc</Button>,
                                <Popconfirm
                                    title="Bạn chắc chắn muốn xóa thông báo này?"
                                    onConfirm={() => handleDelete(item.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button size="small" danger>Xóa</Button>
                                </Popconfirm>
                            ]}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space>
                                    {renderTypeTag(item.type)}
                                    <Text strong>{item.title}</Text>
                                </Space>
                                <Text>{item.message}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                            </Space>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default Reservation_Notification;
