import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tableService from '../../services/table.service';
import { Button, message, Spin, Modal } from 'antd';

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
            console.log('[FE] Gọi API tạo thanh toán PayOS cho orderId:', id);
            const res = await tableService.createPayosPayment(id);
            console.log('[FE] Nhận response tạo thanh toán PayOS:', res);
            if (res && res.data && res.data.paymentUrl) {
                window.location.href = res.data.paymentUrl;
            } else {
                message.error('Không lấy được link thanh toán');
            }
        } catch (err) {
            console.error('[FE] Lỗi khi tạo thanh toán PayOS:', err);
            message.error(err.message || 'Lỗi khi tạo thanh toán');
        }
        setPaying(false);
    };

    if (loading) return <Spin />;

    let paymentStatusText = '';
    let paymentStatusColor = '';
    if (order.paymentStatus === 'success') {
        paymentStatusText = 'Đã thanh toán';
        paymentStatusColor = 'green';
    } else if (order.paymentStatus === 'pending') {
        paymentStatusText = 'Chưa thanh toán';
        paymentStatusColor = 'orange';
    } else if (order.paymentStatus === 'failed') {
        paymentStatusText = 'Thanh toán thất bại';
        paymentStatusColor = 'red';
    } else {
        paymentStatusText = 'Không xác định';
        paymentStatusColor = 'gray';
    }

    return (
        <div style={{ padding: 24 }}>
            <h2>Chi tiết đơn đặt món</h2>
            <p><b>Bàn:</b> {order.tableId?.tableNumber}</p>
            <p><b>Trạng thái:</b> {order.status}</p>
            <p><b>Ngày tạo:</b> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            <p><b>Trạng thái thanh toán:</b> <span style={{ color: paymentStatusColor, fontWeight: 600 }}>{paymentStatusText}</span></p>
            <div>
                <b>Món ăn:</b>
                <ul>
                    {order.foods.map(f => (
                        <li key={f.foodId?._id}>{f.foodId?.name} x{f.quantity}</li>
                    ))}
                </ul>
                <b>Combo:</b>
                <ul>
                    {order.combos.map(c => (
                        <li key={c._id}>Combo #{c.comboId}</li>
                    ))}
                </ul>
            </div>
            <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => handleUpdate(/* dữ liệu cập nhật */)} loading={updating}>
                    Cập nhật đơn
                </Button>
                <Button danger onClick={handleDelete} style={{ marginLeft: 8 }}>
                    Xóa đơn
                </Button>
                <Button onClick={handleSendToChef} style={{ marginLeft: 8 }}>
                    Gửi cho chef
                </Button>
                <Button type="primary" style={{ marginLeft: 8 }} loading={paying} onClick={handlePayWithPayos}>
                    Thanh toán PayOS
                </Button>
            </div>
        </div>
    );
};

export default TableOrder_Detail;
