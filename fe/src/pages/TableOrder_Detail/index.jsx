import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tableService from '../../services/table.service';
import { Button, message, Spin, Modal, Card, Tag, List, Divider, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DollarCircleOutlined, TableOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TableOrder_Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await tableService.getTableOrderById(id);
            setOrder(res.data);
        } catch (err) {
            message.error('Không tìm thấy đơn');
            navigate(-1);
        }
        setLoading(false);
    };

    const handleUpdate = async (updateData) => {
        setUpdating(true);
        try {
            await tableService.servantUpdateTableOrder(id, updateData);
            message.success('Cập nhật thành công');
            fetchOrder();
        } catch (err) {
            message.error('Cập nhật thất bại');
        }
        setUpdating(false);
    };

    const handleDelete = async () => {
        Modal.confirm({
            title: 'Xác nhận xóa đơn?',
            onOk: async () => {
                try {
                    await tableService.servantDeleteTableOrder(id);
                    message.success('Đã xóa đơn');
                    navigate(-1);
                } catch (err) {
                    message.error('Xóa đơn thất bại');
                }
            }
        });
    };

    const handleSendToChef = async () => {
        try {
            await tableService.servantSendTableOrderToChef(id);
            message.success('Đã gửi đơn cho chef');
            fetchOrder();
        } catch (err) {
            message.error('Gửi đơn thất bại');
        }
    };

    const handlePayWithPayos = async () => {
        setPaying(true);
        try {
            const res = await tableService.createPayosPayment(id);
            if (res && res.data && res.data.paymentUrl) {
                window.location.href = res.data.paymentUrl;
            } else {
                message.error('Không lấy được link thanh toán');
            }
        } catch (err) {
            message.error(err.message || 'Lỗi khi tạo thanh toán');
        }
        setPaying(false);
    };

    if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    if (!order) return null;

    // Trạng thái đơn
    let statusTag = <Tag color="default" icon={<ClockCircleOutlined />}>Không xác định</Tag>;
    if (order.status === 'completed') statusTag = <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>;
    else if (order.status === 'pending') statusTag = <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ xác nhận</Tag>;
    else if (order.status === 'cancelled') statusTag = <Tag color="error" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
    else if (order.status === 'confirmed') statusTag = <Tag color="processing" icon={<CheckCircleOutlined />}>Đã nhận</Tag>;
    else if (order.status === 'preparing') statusTag = <Tag color="blue" icon={<ShoppingCartOutlined />}>Đang chuẩn bị</Tag>;

    // Trạng thái thanh toán
    let paymentTag = <Tag color="default" icon={<ClockCircleOutlined />}>Không xác định</Tag>;
    if (order.paymentStatus === 'success') paymentTag = <Tag color="success" icon={<DollarCircleOutlined />}>Đã thanh toán</Tag>;
    else if (order.paymentStatus === 'pending') paymentTag = <Tag color="warning" icon={<ClockCircleOutlined />}>Chưa thanh toán</Tag>;
    else if (order.paymentStatus === 'failed') paymentTag = <Tag color="error" icon={<CloseCircleOutlined />}>Thanh toán thất bại</Tag>;

    return (
        <Row justify="center" style={{ padding: 24 }}>
            <Col xs={24} sm={22} md={18} lg={14} xl={10}>
                <Card
                    title={<span><TableOutlined /> <b>Chi tiết đơn đặt món</b></span>}
                    bordered={false}
                    style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12}>
                            <Text strong>Bàn:</Text> <Text>{order.tableId?.tableNumber || '---'}</Text>
                        </Col>
                        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                            {statusTag} {paymentTag}
                        </Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Text strong>Ngày tạo:</Text> <Text>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                        </Col>
                        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                            <Text strong>Tổng tiền:</Text> <Text type="danger">{order.totalprice?.toLocaleString()}đ</Text>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    <Title level={5} style={{ marginTop: 0 }}>Món ăn</Title>
                    <List
                        dataSource={order.foods}
                        locale={{ emptyText: 'Không có món ăn' }}
                        renderItem={f => (
                            <List.Item>
                                <span>{f.foodId?.name}</span>
                                <span style={{ float: 'right' }}>x{f.quantity}</span>
                            </List.Item>
                        )}
                        size="small"
                        style={{ background: '#fafafa', borderRadius: 8, marginBottom: 8 }}
                    />
                    <Title level={5} style={{ marginTop: 16 }}>Combo</Title>
                    <List
                        dataSource={order.combos}
                        locale={{ emptyText: 'Không có combo' }}
                        renderItem={c => (
                            <List.Item>
                                <span>Combo #{c.comboId}</span>
                            </List.Item>
                        )}
                        size="small"
                        style={{ background: '#fafafa', borderRadius: 8, marginBottom: 8 }}
                    />
                    <Divider style={{ margin: '16px 0' }} />
                    <Row gutter={[8, 8]} justify="end">
                        <Col>
                            <Button type="primary" onClick={() => handleUpdate(/* dữ liệu cập nhật */)} loading={updating}>
                                Cập nhật đơn
                            </Button>
                        </Col>
                        <Col>
                            <Button danger onClick={handleDelete}>
                                Xóa đơn
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={handleSendToChef}>
                                Gửi cho chef
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" loading={paying} onClick={handlePayWithPayos}>
                                Thanh toán PayOS
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <style>{`
                @media (max-width: 600px) {
                    .ant-card {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </Row>
    );
};

export default TableOrder_Detail;
