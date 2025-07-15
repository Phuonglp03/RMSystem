import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import tableService from '../../services/table.service';
import './index.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const TableOrder_Statistics = () => {
    const [type, setType] = useState('month');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const stats = await tableService.getTableOrderStats(type);
            setData(stats.stats || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    // Format data cho chart.js
    const chartData = {
        labels: data.map(item => {
            if (type === 'day') return `${item._id.day}/${item._id.month}/${item._id.year}`;
            if (type === 'week') return `Tuần ${item._id.week}/${item._id.year}`;
            if (type === 'month') return `${item._id.month}/${item._id.year}`;
            if (type === 'year') return `${item._id.year}`;
            return '';
        }),
        datasets: [
            {
                label: 'Số lượng đơn',
                data: data.map(item => item.totalOrders),
                backgroundColor: '#3b82f6',
            },
            {
                label: 'Doanh thu',
                data: data.map(item => item.totalRevenue),
                backgroundColor: '#10b981',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Thống kê đặt món',
            },
        },
    };

    return (
        <div className="stats-container">
            <h2 className="stats-title">Thống kê đặt món</h2>
            <div className="stats-form">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="day">Theo ngày</option>
                    <option value="week">Theo tuần</option>
                    <option value="month">Theo tháng</option>
                    <option value="year">Theo năm</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-stats">Đang tải dữ liệu...</div>
            ) : (
                <div className="chart-container">
                    <Bar data={chartData} options={options} />
                </div>
            )}
        </div>
    );
};

export default TableOrder_Statistics;
