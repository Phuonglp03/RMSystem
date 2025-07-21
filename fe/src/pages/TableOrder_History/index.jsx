import React, { useEffect, useState } from 'react';
import { Spin, Tooltip, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import tableService from '../../services/table.service';
import { ToastContainer, toast } from 'react-toastify';
import './index.css';
import { useNavigate } from 'react-router-dom';

const TableOrder_History = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('accepted'); // accepted = đã nhận, unaccepted = chưa nhận
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8)
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState(''); // all by default


    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, currentPage, statusFilter]);

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            let queryStatus = statusFilter;
            if (tab === 'accepted') {
                queryStatus = 'confirmed'; // hoặc: ['confirmed', 'preparing', ...]
            } else if (tab === 'unaccepted') {
                queryStatus = 'pending';
            }

            const data = await tableService.getAllTableOrders({
                page: currentPage,
                limit: pageSize,
                status: queryStatus
            });
            console.log('[DEBUG] fetched data:', data);
            setOrders(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error(err);
            setOrders([]);
        }
        setLoading(false);
    };


    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined className="status-icon completed" />;
            case 'pending':
                return <ClockCircleOutlined className="status-icon pending" />;
            case 'cancelled':
                return <CloseCircleOutlined className="status-icon cancelled" />;
            case 'confirmed':
                return <CheckCircleOutlined className="status-icon accepted" />;
            default:
                return <ClockCircleOutlined className="status-icon pending" />;
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            await tableService.servantConfirmTableOrder(orderId);
            toast.success('Đã nhận đơn!');
            fetchData(activeTab); // reload
        } catch (err) {
            toast.error('Nhận đơn thất bại');
        }
    };

    const navigate = useNavigate();

    return (
        <div className="history-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1>Lịch sử đơn đặt món</h1>
            <div className="history-tabs">
                <span
                    className={`history-tab ${activeTab === 'unaccepted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unaccepted')}
                >
                    Đơn chưa nhận
                </span>
                <span
                    className={`history-tab ${activeTab === 'accepted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accepted')}
                >
                    Đơn đã nhận
                </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1); // reset page về 1 khi đổi filter
                    }}
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '16px' }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            {loading ? (
                <div className="loading">
                    <Spin size="large" />
                </div>
            ) : orders.length === 0 ? (
                <div className="no-orders">Không có đơn nào</div>
            ) : (
                <>
                    <div className="history-grid">
                        {orders.map(order => (
                            <div className="history-card" key={order._id}>
                                <div className="history-card-header">
                                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                                    <Tooltip title={order.status}>
                                        {getStatusIcon(order.status)}
                                    </Tooltip>
                                </div>
                                <div className="history-card-body">
                                    <p><strong>Bàn:</strong> {order.tableId?.tableNumber || '---'}</p>
                                    <p><strong>Số món:</strong> {order.foods.length + order.combos.length}</p>
                                    <div className="order-items">
                                        {order.foods.map((f, i) => (
                                            <span key={i} className="food-tag">{f.foodId?.name} x{f.quantity}</span>
                                        ))}
                                        {order.combos.map((c, i) => (
                                            <span key={i} className="combo-tag">Combo #{i + 1}</span>
                                        ))}
                                    </div>
                                    <p><strong>Ngày:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                    {order.status === 'pending' && (
                                        <Button type="primary" onClick={() => handleAcceptOrder(order._id)}>
                                            Nhận đơn
                                        </Button>
                                    )}
                                    <Button style={{ marginTop: 8 }} onClick={() => navigate(`/servant/table-order-detail/${order._id}`)}>
                                        Xem chi tiết
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ marginRight: '10px' }}
                        >
                            Trang trước
                        </Button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ marginLeft: '10px' }}
                        >
                            Trang sau
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TableOrder_History;
