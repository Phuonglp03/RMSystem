import React, { useState } from 'react';
import { Input, Button, Card, Typography, Spin } from 'antd';
import reservationService from '../../services/reservation.service';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { ToastContainer, toast } from 'react-toastify';
import { UserOutlined, TableOutlined, TeamOutlined, InfoCircleOutlined, ClockCircleOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Confirm_Customer_Arrived = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [reservation, setReservation] = useState(null);
    const [resCode, setResCode] = useState('')
    const navigate = useNavigate();

    const handleConfirm = async () => {
        if (!code.trim()) {
            toast.warn('Vui lòng nhập mã đặt bàn');
            return;
        }
        setLoading(true);
        try {
            const response = await reservationService.confirmCustomerArrival(code.trim());
            if (response.success) {
                setReservation(response.reservation);
                setResCode(response.reservationCode);
                toast.success('Xác nhận khách đã đến thành công');
            } else {
                toast.error(response.message || 'Không tìm thấy đặt bàn');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Lỗi máy chủ');
        }
        setLoading(false);
    };

    return (
        <div className="confirm-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <Card className="confirm-card">
                <Title level={4} style={{ textAlign: 'center', marginBottom: 18 }}>
                    <UserOutlined style={{ marginRight: 8, color: '#2b4c7e' }} />
                    Xác Nhận Khách Hàng Đã Đến
                </Title>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '18px 0' }}>
                    <Input
                        placeholder="Nhập mã đặt bàn"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ maxWidth: 220 }}
                        disabled={loading}
                        onPressEnter={handleConfirm}
                    />
                    <Button type="primary" onClick={handleConfirm} loading={loading}>
                        Xác nhận
                    </Button>
                </div>

                {loading && <div style={{ textAlign: 'center' }}><Spin /></div>}

                {reservation && (
                    <div className="reservation-info">
                        <Title level={5} style={{ marginBottom: 10 }}>
                            <InfoCircleOutlined style={{ marginRight: 6, color: '#0e7ccf' }} />
                            Thông tin đặt bàn
                        </Title>
                        <div style={{ marginBottom: 4 }}><Text strong><FileTextOutlined style={{ marginRight: 4 }} />Mã đặt bàn:</Text> {code}</div>
                        <div style={{ marginBottom: 4 }}><Text strong><CalendarOutlined style={{ marginRight: 4 }} />Thời gian:</Text> {new Date(reservation.start).toLocaleString()} - {new Date(reservation.end).toLocaleString()}</div>
                        <div style={{ marginBottom: 4 }}><Text strong><TeamOutlined style={{ marginRight: 4 }} />Số khách:</Text> {reservation.numberOfPeople}</div>
                        <div style={{ marginBottom: 4 }}><Text strong><ClockCircleOutlined style={{ marginRight: 4 }} />Trạng thái:</Text> {reservation.status}</div>

                        <Title level={5} style={{ marginTop: 14, marginBottom: 6 }}>
                            <UserOutlined style={{ marginRight: 6, color: '#0e7ccf' }} />Khách hàng
                        </Title>
                        {reservation.customer ? (
                            <div style={{ marginBottom: 8 }}>
                                <div><Text strong>Tên:</Text> {reservation.customer.name}</div>
                                <div><Text strong>Email:</Text> {reservation.customer.email}</div>
                                <div><Text strong>SĐT:</Text> {reservation.customer.phone}</div>
                            </div>
                        ) : <div>Không có thông tin khách</div>}

                        <Title level={5} style={{ marginTop: 12, marginBottom: 6 }}>
                            <TableOutlined style={{ marginRight: 6, color: '#0e7ccf' }} />Bàn đã đặt
                        </Title>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {reservation.table.map((t, idx) => (
                                <Card key={idx} className="table-card">
                                    <div><Text strong>Bàn:</Text> {t.number}</div>
                                    <div><Text strong>Sức chứa:</Text> {t.capacity}</div>
                                    <div><Text strong>Trạng thái:</Text> {t.status}</div>
                                </Card>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 18 }}>
                            <Button type="primary" onClick={() => navigate(`/servant/table-order-create?code=${resCode}`)} disabled={loading}>
                                Đặt món giúp khách
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Confirm_Customer_Arrived;
