import React, { useState } from 'react';
import { Card, Statistic, Row, Col, DatePicker, Radio, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from 'chart.js';
// import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Reservation_Statistics = () => {
    const [mode, setMode] = useState('day'); // 'day' | 'month' | 'year'
    const [date, setDate] = useState(null); // dayjs object
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const fetchStats = async (startDate, endDate) => {
        setLoading(true);
        try {
            // Thay URL này bằng URL thực tế của bạn
            const token = localStorage.getItem('token');
            const res = await fetch(`http:localhost:9999/api/reservations/servant/daily-statistics?startDate=${startDate}&endDate=${endDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.statistics);
            } else {
                setStats(null);
                message.error(data.message || 'Lỗi lấy dữ liệu');
            }
        } catch (err) {
            setStats(null);
            message.error('Lỗi kết nối máy chủ');
        }
        setLoading(false);
    };

    const handleDateChange = (value) => {
        setDate(value);
        if (!value) return;
        let start, end;
        if (mode === 'day') {
            start = value.startOf('day').toISOString();
            end = value.endOf('day').toISOString();
        } else if (mode === 'month') {
            start = value.startOf('month').toISOString();
            end = value.endOf('month').toISOString();
        } else if (mode === 'year') {
            start = value.startOf('year').toISOString();
            end = value.endOf('year').toISOString();
        }
        fetchStats(start, end);
    };

    // Chuẩn bị dữ liệu cho Bar chart
    const barData = {
        labels: ['Tổng số đơn', 'Đã nhận', 'Đã hủy', 'Hoàn thành', 'Không đến'],
        datasets: [
            {
                label: 'Số lượng',
                data: stats ? [
                    stats.totalReservations,
                    stats.confirmed,
                    stats.cancelled,
                    stats.completed,
                    stats.noShow,
                ] : [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#1890ff', // Tổng số đơn
                    '#52c41a', // Đã nhận
                    '#f5222d', // Đã hủy
                    '#13c2c2', // Hoàn thành
                    '#faad14', // Không đến
                ],
                borderRadius: 8,
                maxBarThickness: 48,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 14 } },
            },
            y: {
                beginAtZero: true,
                min: 0,
                grid: { color: '#f0f0f0' },
                ticks: { stepSize: 1, font: { size: 14 } },
            },
        },
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '32px 8px' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Báo cáo Đặt Bàn</Title>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, gap: 12 }}>
                <Radio.Group value={mode} onChange={e => { setMode(e.target.value); setDate(null); setStats(null); }}>
                    <Radio.Button value="day">Theo ngày</Radio.Button>
                    <Radio.Button value="month">Theo tháng</Radio.Button>
                    <Radio.Button value="year">Theo năm</Radio.Button>
                </Radio.Group>
                {mode === 'day' && (
                    <DatePicker
                        value={date}
                        onChange={handleDateChange}
                        allowClear
                        placeholder="Chọn ngày"
                        style={{ minWidth: 120 }}
                    />
                )}
                {mode === 'month' && (
                    <DatePicker.MonthPicker
                        value={date}
                        onChange={handleDateChange}
                        allowClear
                        placeholder="Chọn tháng"
                        style={{ minWidth: 120 }}
                    />
                )}
                {mode === 'year' && (
                    <DatePicker.YearPicker
                        value={date}
                        onChange={handleDateChange}
                        allowClear
                        placeholder="Chọn năm"
                        style={{ minWidth: 120 }}
                    />
                )}
            </div>
            {stats && (
                <>
                    <Row gutter={[16, 16]} justify="center">
                        <Col xs={24} sm={12} md={8}>
                            <Card loading={loading}>
                                <Statistic title="Tổng số đơn" value={stats.totalReservations} valueStyle={{ color: '#1890ff' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card loading={loading}>
                                <Statistic title="Đã nhận" value={stats.confirmed} valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card loading={loading}>
                                <Statistic title="Đã hủy" value={stats.cancelled} valueStyle={{ color: '#f5222d' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card loading={loading}>
                                <Statistic title="Hoàn thành" value={stats.completed} valueStyle={{ color: '#13c2c2' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card loading={loading}>
                                <Statistic title="Không đến" value={stats.noShow} valueStyle={{ color: '#faad14' }} />
                            </Card>
                        </Col>
                    </Row>
                    <div style={{ marginTop: 32 }}>
                        <Bar data={barData} options={barOptions} height={300} />
                    </div>
                </>
            )}
            {!stats && date && !loading && (
                <div style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Không có dữ liệu</div>
            )}
        </div>
    );
};

export default Reservation_Statistics;
