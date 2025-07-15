import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Row, Col, Card, List, Typography, message, Badge, Space, Divider } from 'antd';
import { PlusOutlined, MinusOutlined, CheckCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import tableService from '../../services/table.service';
import foodService from '../../services/food.service';
import { toast, ToastContainer } from 'react-toastify';
import './index.css';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TableOrder_Create_By_Servant = () => {
    const [codeModalVisible, setCodeModalVisible] = useState(true);
    const [reservationCode, setReservationCode] = useState('');
    const [checkingCode, setCheckingCode] = useState(false);
    const [reservation, setReservation] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState({});
    const [placedOrders, setPlacedOrders] = useState({});
    const [foods, setFoods] = useState([]);
    const [combos, setCombos] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const reservationCodeFromUrl = query.get('code');

    useEffect(() => {
        if (reservationCodeFromUrl) {
            // Tự động gọi API check code và mở form đặt món luôn
            setReservationCode(reservationCodeFromUrl);
            handleCheckCode(reservationCodeFromUrl);
            setCodeModalVisible(false); // ẩn modal luôn
        }
    }, [reservationCodeFromUrl]);

    // giả sử dùng api lấy danh sách món & combo
    useEffect(() => {
        const fetchData = async () => {
            try {
                const foodRes = await foodService.getAllFoods(); // cần implement ở tableService
                const comboRes = await foodService.getAllCombos();
                setFoods(foodRes.data || []);
                setCombos(comboRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleCheckCode = async (customCode) => {
        setCheckingCode(true);
        try {
            const codeToCheck = customCode || reservationCode;
            const res = await tableService.getTableOrderFromCustomerByReservationCode(codeToCheck);
            setReservation(res.data);
            toast.success('Mã đặt bàn hợp lệ!');
            setCodeModalVisible(false);
        } catch (err) {
            toast.error('Mã đặt bàn không hợp lệ');
        }
        setCheckingCode(false);
    };

    const addToCart = (item, type) => {
        if (!selectedTable) return;
        const tableId = selectedTable._id;
        const current = cart[tableId] || [];
        const existing = current.find(i => i.id === item._id && i.type === type);
        if (existing) {
            setCart({
                ...cart,
                [tableId]: current.map(i => i.id === item._id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i)
            });
        } else {
            setCart({
                ...cart,
                [tableId]: [...current, { id: item._id, name: item.name, price: item.price, type, quantity: 1 }]
            });
        }
        toast.success(`Đã thêm ${item.name}`);
    };

    const updateCartQuantity = (itemId, type, quantity) => {
        const tableId = selectedTable._id;
        if (quantity <= 0) {
            setCart({
                ...cart,
                [tableId]: cart[tableId].filter(i => !(i.id === itemId && i.type === type))
            });
        } else {
            setCart({
                ...cart,
                [tableId]: cart[tableId].map(i => i.id === itemId && i.type === type ? { ...i, quantity } : i)
            });
        }
    };

    const calculateTotal = (tableId) => {
        return (cart[tableId] || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    };

    const handleSubmitOrder = async () => {
        if (!reservation) return;
        setSubmitting(true);
        try {
            const ordersForAPI = Object.entries(cart).map(([tableId, items]) => ({
                tableId,
                foods: items.filter(i => i.type === 'food').map(i => ({ foodId: i.id, quantity: i.quantity })),
                combos: items.filter(i => i.type === 'combo').map(i => i.id),
                status: 'pending'
            }));
            const data = await tableService.servantCreateTableOrderForCustomer(reservationCode, ordersForAPI);
            setPlacedOrders(data.createdOrders.reduce((acc, order) => {
                acc[order.tableId] = acc[order.tableId] || [];
                acc[order.tableId].push(order);
                return acc;
            }, { ...placedOrders }));
            setCart({});
            message.success('Đặt món thành công!');
        } catch (err) {
            console.error(err);
            toast.error('Đặt món thất bại');
        }
        setSubmitting(false);
    };

    const handleSendToChef = async (orderId) => {
        try {
            await tableService.servantSendTableOrderToChef(orderId);
            toast.success('Đã gửi đơn cho Chef!');
        } catch (err) {
            console.error(err);
            toast.error('Gửi đơn thất bại');
        }
    }
    const handleUpdateFoodStatus = async (orderId, foodId, newStatus) => {
        try {
            await tableService.updateFoodItemStatusInTableOrder(orderId, foodId, newStatus);
            toast.success('Cập nhật trạng thái món thành công');
        } catch (err) {
            console.error(err);
            toast.error('Cập nhật thất bại');
        }
    }
    const handleDeleteFoodItem = async (orderId, foodId) => {
        try {
            await tableService.deleteFoodItemFromTableOrder(orderId, foodId);
            toast.success('Xoá món thành công');
        } catch (err) {
            console.error(err);
            toast.error('Xoá món thất bại');
        }
    }
    const handleTransferOrder = async (orderId) => {
        try {
            await tableService.servantTransferTableOrderToCustomer(orderId);
            toast.success('Đã chuyển đơn cho khách');
        } catch (err) {
            console.error(err);
            toast.error('Chuyển đơn thất bại');
        }
    }


    return (
        <div style={{ padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Modal
                title="Nhập mã đặt bàn"
                open={codeModalVisible}
                onOk={handleCheckCode}
                confirmLoading={checkingCode}
                onCancel={() => navigate('/servant/manage-order')}
                closable
                maskClosable={false}
            >
                <Input value={reservationCode} onChange={e => setReservationCode(e.target.value)} placeholder="Mã đặt bàn" />
            </Modal>

            {!codeModalVisible && reservation && (
                <Row gutter={24}>
                    <Col span={6}>
                        <Card title="Danh sách bàn">
                            <List
                                dataSource={reservation.bookedTable}
                                renderItem={(table) => (
                                    <List.Item
                                        onClick={() => setSelectedTable(table)}
                                        style={{
                                            cursor: 'pointer',
                                            background: selectedTable?._id === table._id ? '#e0e7ff' : '#fff',
                                            margin: '6px 0',
                                            padding: '8px 12px',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <span>Bàn {table.tableNumber}</span>
                                        {selectedTable?._id === table._id && <CheckCircleOutlined style={{ color: '#10b981' }} />}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Món ăn">
                            <List
                                dataSource={foods}
                                renderItem={food => (
                                    <List.Item>
                                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                            <div>{food.name} - {food.price?.toLocaleString()}đ</div>
                                            <Button onClick={() => addToCart(food, 'food')} icon={<PlusOutlined />} />
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                        <Card title="Combo" style={{ marginTop: 16 }}>
                            <List
                                dataSource={combos}
                                renderItem={combo => (
                                    <List.Item>
                                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                            <div>{combo.name} - {combo.price?.toLocaleString()}đ</div>
                                            <Button onClick={() => addToCart(combo, 'combo')} icon={<PlusOutlined />} />
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title={`Giỏ bàn ${selectedTable?.tableNumber || ''}`}>
                            {(cart[selectedTable?._id] || []).map(item => (
                                <div key={item.id + item.type} style={{ marginBottom: 8 }}>
                                    <Space>
                                        <span>{item.name} x {item.quantity}</span>
                                        <Button icon={<MinusOutlined />} size="small" onClick={() => updateCartQuantity(item.id, item.type, item.quantity - 1)} />
                                        <Button icon={<PlusOutlined />} size="small" onClick={() => updateCartQuantity(item.id, item.type, item.quantity + 1)} />
                                    </Space>
                                </div>
                            ))}
                            <Divider />
                            <div><b>Tổng:</b> {calculateTotal(selectedTable?._id).toLocaleString()}đ</div>
                            <Button type="primary" block style={{ marginTop: 12 }} onClick={handleSubmitOrder} loading={submitting}>
                                Xác nhận đặt món
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default TableOrder_Create_By_Servant;
