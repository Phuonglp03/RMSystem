import React, { useState } from 'react';
import { Tabs, Card, Button, Tag, Row, Col, Typography, message } from 'antd';
import './index.css';

const { Title } = Typography;

const Reservation_History = () => {
    const [activeTab, setActiveTab] = useState('unassigned');
    const [unassignedReservations, setUnassignedReservations] = useState([]);
    const [assignedReservations, setAssignedReservation] = useState([]);

    const handleAction = async (reservationId, action) => {
        // Xử lý nhận đơn hoặc từ chối
        message.info(`Bạn đã chọn ${action} cho đơn ${reservationId}`);
    };

    const renderStatus = (status) => {
        if (status === 'pending') return <Tag color="orange">Chờ nhận</Tag>;
        if (status === 'confirmed') return <Tag color="green">Đã nhận</Tag>;
        if (status === 'cancelled') return <Tag color="red">Đã hủy</Tag>;
        return null;
    };

    const renderCard = (resv) => (
        <Card
            key={resv._id}
            style={{ marginBottom: 16 }}
            hoverable
            bodyStyle={{ padding: 16 }}
        >
            <Row justify="space-between" align="middle">
                <Col>
                    <div style={{ fontWeight: 500 }}>{resv.customer?.fullname}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>Thời gian: <b>{resv.startTime}</b></div>
                    <div style={{ color: '#888', fontSize: 13 }}>Số người: <b>{resv.numberOfPeople}</b></div>
                </Col>
                <Col>{renderStatus(resv.status)}</Col>
            </Row>
            {activeTab === 'unassigned' && (
                <Row gutter={8} style={{ marginTop: 12 }}>
                    <Col>
                        <Button type="primary" size="small" onClick={() => handleAction(resv._id, 'confirmed')}>Nhận đơn</Button>
                    </Col>
                    <Col>
                        <Button danger size="small" onClick={() => handleAction(resv._id, 'cancelled')}>Từ chối</Button>
                    </Col>
                </Row>
            )}
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
                                {unassignedReservations.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Không có đơn nào</div>
                                ) : (
                                    unassignedReservations.map(renderCard)
                                )}
                            </div>
                        ),
                    },
                    {
                        key: 'assigned',
                        label: 'Đơn đã nhận',
                        children: (
                            <div>
                                {assignedReservations.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Không có đơn nào</div>
                                ) : (
                                    assignedReservations.map(renderCard)
                                )}
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default Reservation_History;
