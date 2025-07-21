import React, { useState, useEffect } from 'react';
import {
    Card,
    Statistic,
    Row,
    Col,
    DatePicker,
    Radio,
    Typography,
    message,
    Select
} from 'antd';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import reservationService from '../../services/reservation.service';
import tableService from '../../services/table.service';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const { Title } = Typography;

const Servant_Daily_Statistics_Page = () => {
    const [mode, setMode] = useState('day');
    const [date, setDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resStats, setResStats] = useState(null);
    const [orderStats, setOrderStats] = useState([]);

    useEffect(() => {
        if (date) fetchStatistics(date);
        console.log('res: ', resStats);
        console.log('order: ', orderStats);
    }, [mode, date]);

    const fetchStatistics = async (selectedDate) => {
        setLoading(true);
        try {
            const params = {};
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

            const [res, order] = await Promise.all([
                reservationService.getDailyStatistics(params),
                tableService.getTableOrderStats(mode)
            ]);

            setResStats(res || null);
            setOrderStats(order || []);
        } catch (err) {
            console.error('Error:', err);
            message.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const renderReservationStats = () => (
        <>
            <Row gutter={[16, 16]} justify="center" className="statistics-row">
                <Col xs={24} sm={12} md={8}><Card loading={loading}><Statistic title="Tổng số đơn" value={resStats.totalReservations} valueStyle={{ color: '#1890ff' }} /></Card></Col>
                <Col xs={24} sm={12} md={8}><Card loading={loading}><Statistic title="Đã nhận" value={resStats.confirmed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col xs={24} sm={12} md={8}><Card loading={loading}><Statistic title="Đã hủy" value={resStats.cancelled} valueStyle={{ color: '#f5222d' }} /></Card></Col>
                <Col xs={24} sm={12} md={8}><Card loading={loading}><Statistic title="Hoàn thành" value={resStats.completed} valueStyle={{ color: '#13c2c2' }} /></Card></Col>
                <Col xs={24} sm={12} md={8}><Card loading={loading}><Statistic title="Không đến" value={resStats.noShow} valueStyle={{ color: '#faad14' }} /></Card></Col>
            </Row>
            <div className="statistics-chart">
                <Bar
                    height={300}
                    data={{
                        labels: ['Tổng số đơn', 'Đã nhận', 'Đã hủy', 'Hoàn thành', 'Không đến'],
                        datasets: [{
                            label: 'Số lượng',
                            data: [
                                resStats.totalReservations,
                                resStats.confirmed,
                                resStats.cancelled,
                                resStats.completed,
                                resStats.noShow,
                            ],
                            backgroundColor: ['#1890ff', '#52c41a', '#f5222d', '#13c2c2', '#faad14'],
                            borderRadius: 8,
                            maxBarThickness: 48,
                        }]
                    }}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false }, tooltip: { enabled: true } },
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } },
                            x: { ticks: { font: { size: 14 } } },
                        },
                    }}
                />
            </div>
        </>
    );

    const renderOrderStats = () => {
        const chartData = {
            labels: orderStats.map(item => {
                if (mode === 'day') return `${item._id.day}/${item._id.month}/${item._id.year}`;
                if (mode === 'week') return `Tuần ${item._id.week}/${item._id.year}`;
                if (mode === 'month') return `${item._id.month}/${item._id.year}`;
                if (mode === 'year') return `${item._id.year}`;
                return '';
            }),
            datasets: [
                {
                    label: 'Số lượng đơn',
                    data: orderStats.map(item => item.totalOrders),
                    backgroundColor: '#3b82f6',
                },
                {
                    label: 'Doanh thu',
                    data: orderStats.map(item => item.totalRevenue),
                    backgroundColor: '#10b981',
                },
            ],
        };

        return (
            <div className="statistics-chart">
                <Bar data={chartData} options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Thống kê đặt món' },
                    },
                }} />
            </div>
        );
    };

    return (
        <div className="statistics-container">
            <Title level={3} className="statistics-title">Thống kê Ngày (Đặt bàn & Đặt món)</Title>
            <div className="statistics-controls">
                <Radio.Group
                    value={mode}
                    onChange={e => {
                        setMode(e.target.value);
                        setDate(null);
                        setResStats(null);
                        setOrderStats([]);
                    }}
                >
                    <Radio.Button value="day">Theo ngày</Radio.Button>
                    <Radio.Button value="month">Theo tháng</Radio.Button>
                    <Radio.Button value="year">Theo năm</Radio.Button>
                </Radio.Group>

                {mode === 'day' && (
                    <DatePicker value={date} onChange={setDate} placeholder="Chọn ngày" />
                )}
                {mode === 'month' && (
                    <DatePicker picker="month" value={date} onChange={setDate} placeholder="Chọn tháng" />
                )}
                {mode === 'year' && (
                    <DatePicker picker="year" value={date} onChange={setDate} placeholder="Chọn năm" />
                )}
            </div>

            {resStats && renderReservationStats()}
            {orderStats.length > 0 && renderOrderStats()}

            {!loading && !resStats && !orderStats.length && date && (
                <div style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Không có dữ liệu</div>
            )}
        </div>
    );
};

export default Servant_Daily_Statistics_Page;
