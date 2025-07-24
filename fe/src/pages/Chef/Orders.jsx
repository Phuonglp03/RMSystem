import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Tag, Typography, Spin, message, Row, Col, Divider, Radio } from 'antd';
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosInstance from '../../services/axios.service';
import chefService from '../../services/chef.service';

const { Title } = Typography;

const ChefOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState('order'); // 'order' | 'table'
  const pollingRef = useRef();

  // Fetch TableOrder status 'pending' (dùng API mới cho chef)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await chefService.getChefPendingOrders();
      let data = res.data.data || res.data || [];
      setOrders(data);
    } catch (err) {
      setOrders([]);
      message.error('Lỗi khi tải đơn hàng!');
    }
    setLoading(false);
  };

  // Polling mỗi 3s
  useEffect(() => {
    fetchOrders();
    pollingRef.current = setInterval(fetchOrders, 15000);
    return () => clearInterval(pollingRef.current);
  }, []);

  // Hoàn thành đơn
  const completeOrder = async (id) => {
    try {
      await chefService.chefCompleteOrder(id);
      message.success('✅ Đã hoàn thành đơn!');
      fetchOrders();
    } catch (err) {
      message.error('❌ Không thể hoàn thành đơn');
    }
  };

  // Sắp xếp orders theo sortMode
  let sortedOrders = [...orders];
  if (sortMode === 'order') {
    sortedOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortMode === 'table') {
    sortedOrders.sort((a, b) => {
      const ta = a.tableId?.tableNumber || 0;
      const tb = b.tableId?.tableNumber || 0;
      if (ta === tb) return new Date(a.createdAt) - new Date(b.createdAt);
      return ta - tb;
    });
  }

  // Nhóm đơn theo bàn nếu sortMode === 'table'
  const grouped = sortMode === 'table'
    ? sortedOrders.reduce((acc, order) => {
        const tableNum = order.tableId?.tableNumber || 'Không rõ';
        if (!acc[tableNum]) acc[tableNum] = [];
        acc[tableNum].push(order);
        return acc;
      }, {})
    : null;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>👨‍🍳 Đơn chờ chế biến</Title>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>Làm mới</Button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Radio.Group value={sortMode} onChange={e => setSortMode(e.target.value)}>
          <Radio.Button value="order">Xếp theo thứ tự đơn tới trước</Radio.Button>
          <Radio.Button value="table">Xếp theo số bàn</Radio.Button>
        </Radio.Group>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        {sortedOrders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>Không có đơn nào đang chờ chế biến.</div>
        )}
        {sortMode === 'table' ? (
          <Row gutter={[24, 24]}>
            {Object.entries(grouped).map(([tableNum, tableOrders]) => (
              <Col xs={24} md={12} key={tableNum}>
                <Card
                  title={<span style={{ fontWeight: 600, fontSize: 18, color: '#1677ff' }}>Bàn {tableNum}</span>}
                  bordered
                  style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 12px #1677ff22' }}
                >
                  {tableOrders.map((order, idx) => (
                    <div key={order._id} style={{ marginBottom: 24, borderBottom: idx < tableOrders.length - 1 ? '1px solid #eee' : 'none', paddingBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Mã đơn: <b>{order._id.slice(-6)}</b> <Tag color="gold">pending</Tag></span>
                        <Button type="primary" icon={<CheckOutlined />} onClick={() => completeOrder(order._id)}>
                          Hoàn thành
                        </Button>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <b>Món ăn:</b>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {(order.foods || []).map((item, i) => (
                            <li key={i}>🍽 {item.foodId?.name || '[Tên món]'} × {item.quantity}</li>
                          ))}
                        </ul>
                        <b>Combo:</b>
                        {(order.combos || []).map((combo, i) => (
                          <div key={combo._id} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {combo.image && (
                                <img src={combo.image} alt={combo.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                              )}
                              <b>{combo.name}</b>
                            </div>
                            {combo.items && combo.items.length > 0 && (
                              <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                                {combo.items.map((item, idx) => (
                                  <li key={idx} style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {item.foodId?.images && item.foodId.images[0] && (
                                      <img src={item.foodId.images[0]} alt={item.foodId.name} style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                                    )}
                                    {item.foodId?.name || '[Tên món]'} × {item.quantity}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                        Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {sortedOrders.map((order, idx) => (
              <Col xs={24} md={12} key={order._id}>
                <Card
                  title={<span style={{ fontWeight: 600, fontSize: 18, color: '#1677ff' }}>Bàn {order.tableId?.tableNumber || 'Không rõ'}</span>}
                  bordered
                  style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 12px #1677ff22' }}
                >
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Mã đơn: <b>{order._id.slice(-6)}</b> <Tag color="gold">pending</Tag></span>
                      <Button type="primary" icon={<CheckOutlined />} onClick={() => completeOrder(order._id)}>
                        Hoàn thành
                      </Button>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div>
                      <b>Món ăn:</b>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {(order.foods || []).map((item, i) => (
                          <li key={i}>🍽 {item.foodId?.name || '[Tên món]'} × {item.quantity}</li>
                        ))}
                      </ul>
                      <b>Combo:</b>
                      {(order.combos || []).map((combo, i) => (
                        <div key={combo._id} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {combo.image && (
                              <img src={combo.image} alt={combo.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                            )}
                            <b>{combo.name}</b>
                          </div>
                          {combo.items && combo.items.length > 0 && (
                            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                              {combo.items.map((item, idx) => (
                                <li key={idx} style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {item.foodId?.images && item.foodId.images[0] && (
                                    <img src={item.foodId.images[0]} alt={item.foodId.name} style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                                  )}
                                  {item.foodId?.name || '[Tên món]'} × {item.quantity}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                      Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default ChefOrders; 