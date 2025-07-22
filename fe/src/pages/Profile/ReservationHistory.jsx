import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Empty, 
  Spin, 
  message,
  Modal
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import reservationService from '../../services/reservation.service';

const { Title, Text } = Typography;

const statusColors = {
  pending: 'orange',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue'
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn thành'
};

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getUserReservations();
      if (response && response.success) {
        setReservations(response.reservations || []);
      } else {
        message.error('Không thể tải lịch sử đặt bàn');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      message.error('Đã xảy ra lỗi khi tải lịch sử đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  const showReservationDetail = (reservation) => {
    setSelectedReservation(reservation);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã đặt bàn',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => moment(text).format('DD/MM/YYYY')
    },
    {
      title: 'Giờ đặt',
      dataIndex: 'startTime',
      key: 'time',
      render: (text) => moment(text).format('HH:mm')
    },
    {
      title: 'Số người',
      dataIndex: 'numberOfPeople',
      key: 'numberOfPeople'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />} 
          onClick={() => showReservationDetail(record)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải lịch sử đặt bàn...</Text>
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <Empty 
        description="Bạn chưa có đơn đặt bàn nào" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate('/book-table')}>
          Đặt bàn ngay
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={reservations} 
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Chi tiết đặt bàn"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedReservation && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Mã đặt bàn: {selectedReservation.code}</Title>
              <Tag color={statusColors[selectedReservation.status] || 'default'} style={{ marginBottom: 16 }}>
                {statusLabels[selectedReservation.status] || selectedReservation.status}
              </Tag>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space direction="vertical" size="small">
                <div>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <Text>Ngày: {moment(selectedReservation.startTime).format('DD/MM/YYYY')}</Text>
                </div>
                <div>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  <Text>Thời gian: {moment(selectedReservation.startTime).format('HH:mm')} - {moment(selectedReservation.endTime).format('HH:mm')}</Text>
                </div>
                <div>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  <Text>Số người: {selectedReservation.numberOfPeople}</Text>
                </div>
                {selectedReservation.note && (
                  <div>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    <Text>Ghi chú: {selectedReservation.note}</Text>
                  </div>
                )}
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Thông tin bàn</Title>
              {selectedReservation.tables.map((table) => (
                <Tag key={table.id} style={{ marginBottom: 8 }}>
                  Bàn {table.number} ({table.capacity} người)
                </Tag>
              ))}
            </div>

            <div>
              <Title level={5}>Thanh toán</Title>
              <Tag color={selectedReservation.paymentStatus ? 'green' : 'orange'}>
                {selectedReservation.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationHistory; 