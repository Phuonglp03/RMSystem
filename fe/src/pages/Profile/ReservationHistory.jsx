import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axios.service';
import tableService from '../../services/table.service';
import { Table, Tag, Badge, Button, Space, Typography, Empty, Spin, Modal, Descriptions, List, Divider } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';

const { Title } = Typography;

const statusColors = {
  pending: 'orange',
  confirmed: 'blue',
  served: 'purple',
  completed: 'green',
  cancelled: 'red',
};

const paymentStatusColors = {
  pending: 'orange',
  success: 'green',
  failed: 'red',
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | paid | unpaid
  const [detailModal, setDetailModal] = useState({ visible: false, loading: false, orders: [], reservation: null });

  const showDetail = async (reservation) => {
    setDetailModal({ visible: true, loading: true, orders: [], reservation });
    try {
      const res = await tableService.getOrdersByReservationId(reservation.id);
      setDetailModal({ visible: true, loading: false, orders: res.data || [], reservation });
    } catch {
      setDetailModal({ visible: true, loading: false, orders: [], reservation });
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userID');
        if (!userId) {
          setReservations([]);
          setLoading(false);
          return;
        }
        const res = await axiosInstance.get(`/api/reservations/by-user?userId=${userId}`);
        setReservations(res.reservations || []);
      } catch (err) {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'paid') return r.paymentStatus === true || r.paymentStatus === 'success';
    if (filter === 'unpaid') return !r.paymentStatus || r.paymentStatus === false || r.paymentStatus === 'pending' || r.paymentStatus === 'failed';
    return true;
  });

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      render: text => <b>{text}</b>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'startTime',
      key: 'startTime',
      align: 'center',
      render: text => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Số người',
      dataIndex: 'numberOfPeople',
      key: 'numberOfPeople',
      align: 'center',
    },
    {
      title: 'Bàn',
      dataIndex: 'tables',
      key: 'tables',
      align: 'center',
      render: tables => tables && tables.length > 0 ? tables.map(t => <Tag color="blue" key={t.id}>Bàn {t.number}</Tag>) : '-',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      align: 'center',
      render: note => note || <span style={{ color: '#aaa' }}>Không có</span>,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      align: 'center',
      render: status => (
        <Badge
          status={status === 'success' ? 'success' : status === 'failed' ? 'error' : 'processing'}
          text={status === 'success' ? 'Đã thanh toán' : status === 'failed' ? 'Thất bại' : 'Chưa thanh toán'}
          color={paymentStatusColors[status] || 'orange'}
        />
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: status => <Tag color={statusColors[status] || 'default'}>{status}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button size="small" onClick={() => showDetail(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Lịch sử đặt bàn của bạn</Title>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Button type={filter==='all' ? 'primary' : 'default'} onClick={() => setFilter('all')}>Tất cả</Button>
        <Button type={filter==='paid' ? 'primary' : 'default'} onClick={() => setFilter('paid')} style={{marginLeft:8}}>Đã thanh toán</Button>
        <Button type={filter==='unpaid' ? 'primary' : 'default'} onClick={() => setFilter('unpaid')} style={{marginLeft:8}}>Chưa thanh toán</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}><Spin size="large" /></div>
      ) : filteredReservations.length === 0 ? (
        <Empty description="Không có đơn đặt bàn nào." style={{ margin: '40px 0' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredReservations}
          rowKey="id"
          bordered
          pagination={{ pageSize: 5 }}
          style={{ background: '#fff', borderRadius: 8 }}
        />
      )}
      <Modal
        open={detailModal.visible}
        title={`Chi tiết món ăn của đơn ${detailModal.reservation?.code || ''}`}
        onCancel={() => setDetailModal({ ...detailModal, visible: false })}
        footer={<Button onClick={() => setDetailModal({ ...detailModal, visible: false })}>Đóng</Button>}
        width={700}
      >
        {detailModal.loading ? <Spin /> : (
          detailModal.orders.length === 0 ? <Empty description="Không có món nào." /> : (
            <div>
              {detailModal.orders.map((order, idx) => (
                <div key={order._id || idx} style={{ marginBottom: 24 }}>
                  <Divider orientation="left">Bàn {order.tableId?.tableNumber || order.tableId || ''}</Divider>
                  {Array.isArray(order.foods) && order.foods.length > 0 ? (
                    <List
                      header={<b>Danh sách món ăn</b>}
                      dataSource={order.foods}
                      renderItem={item => (
                        <List.Item>
                          {item.foodId?.name || item.foodId || 'Món'} x {item.quantity || 1} <span style={{ float: 'right' }}>{item.foodId?.price ? `${item.foodId.price.toLocaleString()}đ` : ''}</span>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ color: '#aaa', textAlign: 'center', margin: 12 }}>Không có món nào trong đơn này.</div>
                  )}
                  {order.combos && order.combos.length > 0 && (
                    <>
                      <Divider orientation="left">Combo</Divider>
                      <List
                        dataSource={order.combos}
                        renderItem={combo => (
                          <List.Item>
                            Combo: {combo.comboId?.name || combo.comboId || ''} x {combo.quantity || 1}
                          </List.Item>
                        )}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default ReservationHistory; 