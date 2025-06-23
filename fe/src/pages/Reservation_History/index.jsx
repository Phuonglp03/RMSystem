import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Tag, Row, Col, Typography, message, Spin } from 'antd';
import reservationService from '../../services/reservation.service';

const { Title } = Typography;

const Reservation_History = () => {
    const [activeTab, setActiveTab] = useState('unassigned');
    const [unassignedReservations, setUnassignedReservations] = useState([]);
    const [assignedReservations, setAssignedReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'unassigned') {
                    const res = await reservationService.getUnAssignedReservations();
                    setUnassignedReservations(res.reservations || []);
                } else {
                    const res = await reservationService.getCustomerReservationByServant();
                    setAssignedReservations(res.reservations || []);
                }
            } catch (err) {
                message.error('Lỗi khi tải dữ liệu đặt bàn');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleAction = async (reservationId, action) => {
        // Xử lý nhận đơn hoặc từ chối
        message.info(`Bạn đã chọn ${action} cho đơn ${reservationId}`);
    };

    const handleViewDetail = (reservationId) => {
        // Hiển thị chi tiết đơn (có thể mở modal hoặc chuyển trang)
        message.info(`Xem chi tiết đơn: ${reservationId}`);
    };

    const renderStatus = (status) => {
        if (status === 'pending') return <Tag color="orange">Chờ nhận</Tag>;
        if (status === 'confirmed') return <Tag color="green">Đã nhận</Tag>;
        if (status === 'cancelled') return <Tag color="red">Đã hủy</Tag>;
        return null;
    };

    const renderCard = (resv) => (
        <Card
            key={resv._id || resv.reservationId}
            style={{ marginBottom: 16 }}
            hoverable
            bodyStyle={{ padding: 16 }}
        >
            <Row justify="space-between" align="middle">
                <Col>
                    <div style={{ fontWeight: 500 }}>{resv.customer?.fullname || resv.customer?.name}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>Thời gian: <b>{resv.startTime || resv.bookingTime}</b></div>
                    <div style={{ color: '#888', fontSize: 13 }}>Số người: <b>{resv.numberOfPeople}</b></div>
                </Col>
                <Col>{renderStatus(resv.status)}</Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 12 }}>
                {activeTab === 'unassigned' && (
                    <>
                        <Col>
                            <Button type="primary" size="small" onClick={() => handleAction(resv._id, 'confirmed')}>Nhận đơn</Button>
                        </Col>
                        <Col>
                            <Button danger size="small" onClick={() => handleAction(resv._id, 'cancelled')}>Từ chối</Button>
                        </Col>
                    </>
                )}
                <Col>
                    <Button size="small" onClick={() => handleViewDetail(resv._id || resv.reservationId)}>Xem chi tiết</Button>
                </Col>
            </Row>
        </Card>
    );

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: '24px 8px' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Lịch sử Đặt Bàn</Title>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                items={[
                    {
                        key: 'unassigned',
                        label: 'Đơn chưa nhận',
                        children: (
                            <div>
                                {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
                                    (unassignedReservations.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Không có đơn nào</div>
                                    ) : (
                                        unassignedReservations.map(renderCard)
                                    ))}
                            </div>
                        ),
                    },
                    {
                        key: 'assigned',
                        label: 'Đơn đã nhận',
                        children: (
                            <div>
                                {loading ? <Spin style={{ display: 'block', margin: '40px auto' }} /> :
                                    (assignedReservations.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Không có đơn nào</div>
                                    ) : (
                                        assignedReservations.map(renderCard)
                                    ))}
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default Reservation_History;
