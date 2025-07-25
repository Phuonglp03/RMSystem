import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axios.service';
import tableService from '../../services/table.service';
import { Table, Tag, Badge, Button, Space, Typography, Empty, Spin, Modal, Descriptions, List, Divider } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

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
  completed: 'green', // Thêm completed
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | paid | unpaid
  const navigate = useNavigate();

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

  const filteredReservations = reservations
    .map(r => ({
      ...r,
      paymentStatus: r.paymentStatus === true ? 'success'
        : r.paymentStatus === false ? 'pending'
        : r.paymentStatus || 'pending',
    }))
    .filter(r => {
      if (filter === 'all') return true;
      if (filter === 'paid') return r.paymentStatus === 'success';
      if (filter === 'unpaid') return r.paymentStatus === 'pending' || r.paymentStatus === 'failed';
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
          status={
            status === 'success' || status === 'completed'
              ? 'success'
              : status === 'failed'
              ? 'error'
              : 'processing'
          }
          text={
            status === 'success' || status === 'completed'
              ? 'Đã thanh toán'
              : status === 'failed'
              ? 'Thất bại'
              : 'Chưa thanh toán'
          }
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
        (record.status === 'completed' && (record.paymentStatus === 'success' || record.paymentStatus === 'completed')) ? (
          <Button size="small" onClick={() => navigate(`/reservation/${record.id}`)}>
            Xem chi tiết
          </Button>
        ) : null
      ),
    },
  ];

  // Hàm tổng hợp món ăn và combo từ nhiều order
  function aggregateFoodsAndCombos(orders) {
    const foodMap = {};
    const comboMap = {};
    let total = 0;
    orders.forEach(order => {
      total += order.totalprice || 0;
      (order.foods || []).forEach(f => {
        // Lấy name và price từ foodId (chuẩn hóa cho mọi trường hợp)
        const id = f.foodId?._id || f.foodId;
        const name = f.foodId?.name || '';
        const price = f.foodId?.price || 0;
        if (!foodMap[id]) foodMap[id] = { name, quantity: 0, price };
        foodMap[id].quantity += f.quantity || 1;
      });
      (order.combos || []).forEach(c => {
        const id = c._id || c;
        const name = c.name || '';
        const price = c.price || 0;
        if (!comboMap[id]) comboMap[id] = { name, quantity: 0, price };
        comboMap[id].quantity += 1;
      });
    });
    return {
      foods: Object.values(foodMap),
      combos: Object.values(comboMap),
      total
    };
  }

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
      {/* Bỏ Modal chi tiết */}
    </div>
  );
};

export default ReservationHistory; 