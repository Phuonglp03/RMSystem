import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axios.service';
import { List, Divider, Spin, Empty, Button, Typography, Card } from 'antd';

const { Title } = Typography;

const priceStyle = { color: 'black', fontWeight: 600, fontSize: 16 };
const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px #6366f122',
  marginBottom: 18,
  border: '1.5px solid #e0e7ff',
  padding: 0
};

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/reservations/${id}/detail`);
        setFoods(res.data.foods || []);
        setCombos(res.data.combos || []);
        setTotal(res.data.totalAmount || 0);
      } catch {
        setFoods([]);
        setCombos([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, background: '#f8fafc', borderRadius: 18, minHeight: 500 }}>
      <Button onClick={() => navigate('/profile', { state: { tab: 'reservations' } })} style={{ marginBottom: 24, borderRadius: 8, fontWeight: 500 }}>Quay lại</Button>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: '#10b981', fontWeight: 800, letterSpacing: 1 }}>Chi tiết hoá đơn</Title>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '60px auto' }} /> : (
        foods.length === 0 && combos.length === 0 ? <Empty description="Không có món nào." style={{ margin: '60px 0' }} /> : (
          <div>
            <Divider orientation="left" style={{ fontWeight: 700, color: '#6366f1' }}>Danh sách món ăn</Divider>
            <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
              <List
                dataSource={foods}
                renderItem={item => (
                  <List.Item style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 500 }}>
                    <span>{item.name} <span style={{ color: '#6366f1', fontWeight: 700 }}>x {item.quantity}</span></span>
                    <span style={priceStyle}>{item.price ? `${item.price.toLocaleString()}đ` : ''}</span>
                  </List.Item>
                )}
                locale={{ emptyText: <span style={{ color: '#aaa' }}>Không có món ăn</span> }}
              />
            </Card>
            {combos.length > 0 && (
              <>
                <Divider orientation="left" style={{ fontWeight: 700, color: '#6366f1' }}>Combo</Divider>
                <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
                  <List
                    dataSource={combos}
                    renderItem={combo => (
                      <List.Item style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 500 }}>
                        <span>Combo: <span style={{ color: '#10b981', fontWeight: 700 }}>{combo.name}</span> <span style={{ color: '#6366f1', fontWeight: 700 }}>x {combo.quantity}</span></span>
                        <span style={priceStyle}>{combo.price ? `${combo.price.toLocaleString()}đ` : ''}</span>
                      </List.Item>
                    )}
                    locale={{ emptyText: <span style={{ color: '#aaa' }}>Không có combo</span> }}
                  />
                </Card>
              </>
            )}
            <Divider />
            <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 22, color: '#ff4d4f', marginTop: 18 }}>
              Tổng tiền: {total.toLocaleString()}đ
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ReservationDetail; 