import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Input,
  Tag,
  Button,
  message,
  Space,
  Typography,
  Pagination,
} from 'antd';
import { CheckOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PAGE_SIZE = 5;

const ChefDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:9999/api/chef');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải đơn hàng!');
    }
  };

  const completeOrder = async (id) => {
    try {
      await axios.post(`http://localhost:9999/api/chef/${id}/complete`);
      message.success('✅ Đã hoàn thành đơn!');
      fetchOrders();
    } catch (err) {
      message.error('❌ Không thể hoàn thành đơn');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      return (
        order._id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.tableId?.tableNumber?.toString().includes(searchText)
      );
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchText, orders]);

  const statusColors = {
    preparing: 'gold',
    completed: 'green',
    cancelled: 'red',
    pending: 'default',
    confirmed: 'blue',
    ready_to_serve: 'cyan',
    served: 'purple',
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <span>{text.slice(-6)}</span>,
    },
    {
      title: 'Bàn số',
      dataIndex: ['tableId', 'tableNumber'],
      key: 'table',
      render: (num) => <span>Bàn {num ?? 'Không rõ'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Món ăn',
      key: 'foods',
      render: (_, record) => (
        <ul style={{ paddingLeft: 16 }}>
          {record.foods?.map((item, idx) => (
            <li key={idx}>
              🍽 {item.foodId?.name ?? '[Tên món]'} × {item.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) =>
        record.status !== 'completed' ? (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => completeOrder(record._id)}
          >
            Hoàn thành
          </Button>
        ) : (
          <span>
            ✅ lúc{' '}
            {new Date(record.completedAt).toLocaleString('vi-VN')}
          </span>
        ),
    },
  ];

  const paginatedData = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        👨‍🍳 Quản lý đơn hàng
      </Title>

      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <Input
          placeholder="Tìm mã đơn hoặc bàn số"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey="_id"
        pagination={false}
        bordered
      />

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={filteredOrders.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ChefDashboard;
