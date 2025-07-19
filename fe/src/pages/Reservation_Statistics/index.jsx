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
import './index.css';
import reservationService from '../../services/reservation.service';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const { Title } = Typography;

const Reservation_Statistics = () => {
    const [mode, setMode] = useState('day'); // 'day' | 'month' | 'year'
    const [date, setDate] = useState(null); // dayjs object
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    const fetchStats = async (selectedDate) => {
        setLoading(true);
        try {
            let params = {};
            if (mode === 'day') {
                params.startDate = selectedDate.startOf('day').toISOString();
                params.endDate = selectedDate.endOf('day').toISOString();
            } else if (mode === 'month') {
                params.startDate = selectedDate.startOf('month').toISOString();
                params.endDate = selectedDate.endOf('month').toISOString();
            } else if (mode === 'year') {
                params.startDate = selectedDate.startOf('year').toISOString();
                params.endDate = selectedDate.endOf('year').toISOString();
            }

            const response = await reservationService.getDailyStatistics(params);
            const statsData = response?.statistics || response?.data?.statistics || {};
            
            // Validate and set safe default values
            setStats({
                totalReservations: safeNumber(statsData.totalReservations),
                confirmed: safeNumber(statsData.confirmed),
                cancelled: safeNumber(statsData.cancelled),
                completed: safeNumber(statsData.completed),
                noShow: safeNumber(statsData.noShow)
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
            setStats({
                totalReservations: 0,
                confirmed: 0,
                cancelled: 0,
                completed: 0,
                noShow: 0
            });
            message.error(err?.response?.data?.message || err.message || 'Lỗi lấy dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (value) => {
        setDate(value);
        setStats(null);
        if (value) {
            fetchStats(value);
        }
    };

    // Safe number function
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    // Bar chart data
    const barData = {
        labels: ['Tổng số đơn', 'Đã nhận', 'Đã hủy', 'Hoàn thành', 'Không đến'],
        datasets: [
            {
                label: 'Số lượng',
                data: stats ? [
                    safeNumber(stats.totalReservations),
                    safeNumber(stats.confirmed),
                    safeNumber(stats.cancelled),
                    safeNumber(stats.completed),
                    safeNumber(stats.noShow),
                ] : [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#1890ff', '#52c41a', '#f5222d', '#13c2c2', '#faad14'
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
        <div className="statistics-container">
            <Title level={3} className="statistics-title">Báo cáo Đặt Bàn</Title>
            <div className="statistics-controls">
                <Radio.Group
                    value={mode}
                    onChange={e => {
                        setMode(e.target.value);
                        setDate(null);
                        setStats(null);
                    }}
                >
                    <Radio.Button value="day">Theo ngày</Radio.Button>
                    <Radio.Button value="month">Theo tháng</Radio.Button>
                    <Radio.Button value="year">Theo năm</Radio.Button>
                </Radio.Group>
                {mode === 'day' && (
                    <DatePicker value={date} onChange={handleDateChange} allowClear placeholder="Chọn ngày" />
                )}
                {mode === 'month' && (
                    <DatePicker picker="month" value={date} onChange={handleDateChange} allowClear placeholder="Chọn tháng" />
                )}
                {mode === 'year' && (
                    <DatePicker picker="year" value={date} onChange={handleDateChange} allowClear placeholder="Chọn năm" />
                )}
            </div>
            {stats && (
                <>
                    <Row gutter={[16, 16]} justify="center" className="statistics-row">
                        <Col xs={24} sm={12} md={8} className="statistics-card">
                            <Card loading={loading}>
                                <Statistic title="Tổng số đơn" value={safeNumber(stats.totalReservations)} valueStyle={{ color: '#1890ff' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} className="statistics-card">
                            <Card loading={loading}>
                                <Statistic title="Đã nhận" value={safeNumber(stats.confirmed)} valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} className="statistics-card">
                            <Card loading={loading}>
                                <Statistic title="Đã hủy" value={safeNumber(stats.cancelled)} valueStyle={{ color: '#f5222d' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} className="statistics-card">
                            <Card loading={loading}>
                                <Statistic title="Hoàn thành" value={safeNumber(stats.completed)} valueStyle={{ color: '#13c2c2' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} className="statistics-card">
                            <Card loading={loading}>
                                <Statistic title="Không đến" value={safeNumber(stats.noShow)} valueStyle={{ color: '#faad14' }} />
                            </Card>
                        </Col>
                    </Row>
                    <div className="statistics-chart">
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
