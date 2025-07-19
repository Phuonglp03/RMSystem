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
            const response = await tableService.getTableOrderStats(type);
            const statsData = response?.stats || response?.data?.stats || response?.data || [];
            
            // Validate and sanitize data
            const validatedData = Array.isArray(statsData) ? statsData.map(item => ({
                ...item,
                totalOrders: safeNumber(item?.totalOrders),
                totalRevenue: safeNumber(item?.totalRevenue),
                _id: item?._id || {}
            })) : [];
            
            setData(validatedData);
        } catch (err) {
            console.error('Error fetching table order stats:', err);
            setData([]);
        }
        setLoading(false);
    };

    // Safe data processing function
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const safeArray = Array.isArray(data) ? data : [];

    // Format data cho chart.js
    const chartData = {
        labels: safeArray.map(item => {
            if (!item || !item._id) return 'N/A';
            if (type === 'day') return `${item._id.day || 0}/${item._id.month || 0}/${item._id.year || 0}`;
            if (type === 'week') return `Tuần ${item._id.week || 0}/${item._id.year || 0}`;
            if (type === 'month') return `${item._id.month || 0}/${item._id.year || 0}`;
            if (type === 'year') return `${item._id.year || 0}`;
            return 'N/A';
        }),
        datasets: [
            {
                label: 'Số lượng đơn',
                data: safeArray.map(item => safeNumber(item?.totalOrders)),
                backgroundColor: '#3b82f6',
            },
            {
                label: 'Doanh thu',
                data: safeArray.map(item => safeNumber(item?.totalRevenue)),
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
