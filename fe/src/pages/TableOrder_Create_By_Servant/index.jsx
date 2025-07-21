import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Row, Col, Card, List, Typography, message, Badge, Space, Divider, Checkbox } from 'antd';
import { PlusOutlined, MinusOutlined, CheckCircleOutlined, ShoppingCartOutlined, TableOutlined } from '@ant-design/icons';
import tableService from '../../services/table.service';
import { foodService } from '../../services/food.service';
import comboService from '../../services/combo.service';
import { toast, ToastContainer } from 'react-toastify';
import './index.css';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TableOrder_Create_By_Servant = () => {
    const [codeModalVisible, setCodeModalVisible] = useState(true);
    const [reservationCode, setReservationCode] = useState('');
    const [checkingCode, setCheckingCode] = useState(false);
    const [reservation, setReservation] = useState(null);
    const [selectedTable, setSelectedTable] = useState([]);
    const [cart, setCart] = useState({});
    const [placedOrders, setPlacedOrders] = useState({});
    const [foods, setFoods] = useState([]);
    const [combos, setCombos] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const reservationCodeFromUrl = query.get('code');
    const [showPaymentChoice, setShowPaymentChoice] = useState(false);
    const [lastTotal, setLastTotal] = useState(0);
    const [createdOrders, setCreatedOrders] = useState([]); // Danh sách đơn vừa tạo
    const [confirmingOrderId, setConfirmingOrderId] = useState(null); // Đơn đang xác nhận
    const [firstCreatedOrderId, setFirstCreatedOrderId] = useState(null); // Lưu id đơn đầu tiên
    const [confirmVisible, setConfirmVisible] = useState(false);


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
                setFoods(foodRes || []);
                setCombos(comboRes || []);
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
            setReservation(res);
            toast.success('Mã đặt bàn hợp lệ!');
            setCodeModalVisible(false);
        } catch (err) {
            toast.error('Mã đặt bàn không hợp lệ');
        }
        setCheckingCode(false);
    };

    const handleToggleTable = (tableId) => {
        setSelectedTable(prev =>
            prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
        );
    };


    const addToCart = (item, type) => {
        if (!selectedTable) return;
        selectedTable.forEach(tableId => {
            const current = cart[tableId] || [];
            const existing = current.find(i => i.id === item._id && i.type === type);
            if (existing) {
                setCart(prev => ({
                    ...prev,
                    [tableId]: current.map(i =>
                        i.id === item._id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i
                    )
                }));
            } else {
                setCart(prev => ({
                    ...prev,
                    [tableId]: [...current, { id: item._id, name: item.name, price: item.price, type, quantity: 1 }]
                }));
            }
        });
        toast.success(`Đã thêm ${item.name}`);
    };

    const updateCartQuantity = (itemId, type, quantity) => {
        selectedTable.forEach(tableId => {
            if (quantity <= 0) {
                setCart(prev => ({
                    ...prev,
                    [tableId]: (prev[tableId] || []).filter(i => !(i.id === itemId && i.type === type))
                }));
            } else {
                setCart(prev => ({
                    ...prev,
                    [tableId]: (prev[tableId] || []).map(i =>
                        i.id === itemId && i.type === type ? { ...i, quantity } : i
                    )
                }));
            }
        });

    };

    const calculateTotal = (tableId) => {
        return (cart[tableId] || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    };

    const handleSubmitOrder = async () => {
        if (!reservation) return;
        setSubmitting(true);
        try {
            const tableId = selectedTable;
            console.log('tableId: ', selectedTable)
            if (!tableId) {
                toast.warning('Bạn chưa chọn bàn!');
                setSubmitting(false);
                return;
            }
            const items = cart[tableId] || [];
            if (items.length === 0) {
                toast.warning('Bạn chưa chọn món!');
                setSubmitting(false);
                return;
            }
            const ordersForAPI = [{
                tableId,
                foods: items.filter(i => i.type === 'food').map(i => ({ foodId: i.id, quantity: i.quantity })),
                combos: items.filter(i => i.type === 'combo').map(i => i.id),
                status: 'pending'
            }];
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

    // Hàm xác nhận đơn đặt món
    const handleConfirmOrder = async (orderId) => {
        setConfirmingOrderId(orderId);
        try {
            await tableService.servantCreateTableOrderForCustomer(orderId);
            toast.success('Xác nhận đơn thành công!');
            setCreatedOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'confirmed' } : o));
        } catch (err) {
            toast.error('Xác nhận đơn thất bại!');
        } finally {
            setConfirmingOrderId(null);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Modal
                title={<span><TableOutlined /> <b>Nhập mã đặt bàn</b></span>}
                open={codeModalVisible}
                onOk={() => handleCheckCode(reservationCode)}
                confirmLoading={checkingCode}
                onCancel={() => navigate('/servant/manage-order')}
                closable
                maskClosable={false}
            >
                <Input value={reservationCode} onChange={e => setReservationCode(e.target.value)} placeholder="Mã đặt bàn" />
            </Modal>

            {!codeModalVisible && reservation && (
                <Card bordered style={{ borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>Tạo đơn đặt món cho khách</Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                            <Card title="Danh sách bàn" bordered={false} style={{ borderRadius: 8, minHeight: 300 }}>
                                <List
                                    dataSource={reservation.bookedTable}
                                    renderItem={table => (
                                        <List.Item>
                                            <Checkbox
                                                checked={selectedTable.includes(table._id)}
                                                onChange={() => handleToggleTable(table._id)}
                                            >
                                                Bàn {table.tableNumber} - Sức chứa: {table.capacity}
                                            </Checkbox>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={24} md={16} lg={12} xl={12}>
                            <Card title="Món ăn" bordered={false} style={{ borderRadius: 8 }}>
                                <List
                                    dataSource={foods}
                                    renderItem={food => (
                                        <List.Item>
                                            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {food.images?.[0] ? (
                                                        <img src={food.images[0]} alt={food.name} width={48} height={48} style={{ borderRadius: 6, objectFit: 'cover', background: '#f0f0f0' }} />
                                                    ) : (
                                                        <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f0f0f0' }} />
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{food.name}</div>
                                                        <Text type="secondary">{food.price?.toLocaleString()}đ</Text>
                                                    </div>
                                                </div>
                                                <Button onClick={() => addToCart(food, 'food')} icon={<PlusOutlined />} />
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                            <Card title="Combo" bordered={false} style={{ marginTop: 16, borderRadius: 8 }}>
                                <List
                                    dataSource={combos}
                                    renderItem={combo => (
                                        <List.Item key={combo._id}>
                                            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {combo.image ? (
                                                        <img src={combo.image} alt={combo.name} width={48} height={48} style={{ borderRadius: 6, objectFit: 'cover', background: '#f0f0f0' }} />
                                                    ) : (
                                                        <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f0f0f0' }} />
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{combo.name}</div>
                                                        <Text type="secondary">{combo.price?.toLocaleString()}đ</Text>
                                                    </div>
                                                </div>
                                                <Button onClick={() => addToCart(combo, 'combo')} icon={<PlusOutlined />} />
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                            {selectedTable.length === 0 ? (
                                <Card bordered={false} style={{ borderRadius: 8, minHeight: 200, textAlign: 'center', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div>Chọn bàn để bắt đầu đặt món</div>
                                </Card>
                            ) : (
                                selectedTable.map(tableId => (
                                    <Card key={tableId} title={`Giỏ bàn ${tableId}`} style={{ marginBottom: 16, borderRadius: 8 }} bordered={false}>
                                        {(cart[tableId] || []).map(item => (
                                            <div key={item.id + item.type} style={{ marginBottom: 8 }}>
                                                <Space>
                                                    <span>{item.name} x {item.quantity}</span>
                                                    <Button icon={<MinusOutlined />} size="small" onClick={() => updateCartQuantity(item.id, item.type, item.quantity - 1)} />
                                                    <Button icon={<PlusOutlined />} size="small" onClick={() => updateCartQuantity(item.id, item.type, item.quantity + 1)} />
                                                </Space>
                                            </div>
                                        ))}
                                        <Divider />
                                        <div style={{ fontWeight: 500 }}><b>Tổng:</b> {calculateTotal(tableId).toLocaleString()}đ</div>
                                    </Card>
                                ))
                            )}
                            <Button
                                type="primary"
                                block
                                style={{ marginTop: 8, fontWeight: 600, fontSize: 16, height: 48 }}
                                onClick={handleSubmitOrder}
                                loading={submitting}
                                disabled={selectedTable.length === 0}
                            >
                                Đặt món
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}
            {/* Danh sách đơn vừa tạo và xác nhận */}
            {createdOrders.length > 0 && (
                <Card title="Xác nhận đơn đặt món" style={{ marginTop: 24, borderRadius: 12 }}>
                    <List
                        dataSource={createdOrders}
                        renderItem={order => (
                            <List.Item actions={[
                                order.status === 'confirmed' ? (
                                    <span style={{ color: 'green' }}>Đã xác nhận</span>
                                ) : (
                                    <Button
                                        type="primary"
                                        loading={confirmingOrderId === order._id}
                                        onClick={() => handleConfirmOrder(order._id)}
                                    >
                                        Xác nhận
                                    </Button>
                                )
                            ]}>
                                <div>
                                    <b>Bàn:</b> {order.tableId}<br />
                                    <b>Tổng tiền:</b> {order.totalprice?.toLocaleString()}đ
                                </div>
                            </List.Item>
                        )}
                    />
                </Card>
            )}
            {showPaymentChoice && (
                <Modal
                    title="Đặt món thành công"
                    open={showPaymentChoice}
                    onCancel={() => {
                        setShowPaymentChoice(false);
                        navigate('/servant/table-order-history');
                    }}
                    footer={[
                        <Button key="later" onClick={() => {
                            setShowPaymentChoice(false);
                            navigate('/servant/table-order-history');
                        }}>
                            Thanh toán sau
                        </Button>,
                        <Button key="now" type="primary" onClick={() => {
                            setShowPaymentChoice(false);
                            if (firstCreatedOrderId) {
                                navigate(`/servant/table-order-detail/${firstCreatedOrderId}`);
                            } else {
                                navigate('/servant/table-order-history');
                            }
                        }}>
                            Thanh toán ngay
                        </Button>,
                    ]}
                >
                    <p>Đơn đặt món đã được gửi thành công. Bạn muốn thanh toán ngay hay thanh toán sau?</p>
                    <p><b>Tổng tiền:</b> {lastTotal.toLocaleString()}đ</p>
                </Modal>
            )}
            <style>{`
                @media (max-width: 768px) {
                    .ant-card {
                        margin-bottom: 16px !important;
                    }
                    .ant-row {
                        flex-direction: column !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default TableOrder_Create_By_Servant;
