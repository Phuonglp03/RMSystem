import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Tag, Input, Typography, message, Button, Modal, Form, Select, DatePicker, Tabs } from 'antd';
import servantService from '../../../services/servant.service';
import dayjs from 'dayjs';
import tableService from '../../../services/table.service';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'served', label: 'Đã phục vụ' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const ReservationManage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [updating, setUpdating] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'day')]);
  const [allTables, setAllTables] = useState([]);
  const editFormRef = useRef();

  useEffect(() => {
    fetchReservations();
    fetchAllTables();
  }, [statusFilter, dateRange]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
      }
      const res = await servantService.getAllReservations(params);
      setReservations(res);
    } catch (err) {
      message.error('Không lấy được danh sách đơn đặt bàn');
    }
    setLoading(false);
  };

  const fetchAllTables = async () => {
    try {
      const res = await tableService.getAllTables();
      // Ưu tiên lấy res.tables (theo API backend), nếu không có thì lấy res.data hoặc res
      setAllTables(res.tables || res.data || res || []);
    } catch (err) {
      setAllTables([]);
    }
  };

  const getCustomer = (r) => Array.isArray(r.customerId) ? r.customerId[0]?.userId : r.customerId?.userId;

  const filteredReservations = reservations.filter(r => {
    if (!search) return true;
    const code = r.reservationCode?.toLowerCase() || '';
    const customer = (getCustomer(r)?.fullname || '').toLowerCase();
    const phone = (getCustomer(r)?.phone || '').toLowerCase();
    return code.includes(search.toLowerCase()) || customer.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
  });

  const handleStatusChange = async (id, status) => {
    setUpdating(true);
    try {
      await servantService.updateReservationStatus(id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchReservations();
      setDetailModal({ open: false, data: null });
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
    setUpdating(false);
  };

  const handleEdit = async (id, values) => {
    setUpdating(true);
    try {
      await servantService.updateReservation(id, values);
      message.success('Cập nhật thông tin thành công');
      fetchReservations();
      setEditModal({ open: false, data: null });
      setDetailModal({ open: false, data: null });
    } catch (err) {
      // Nếu message có chứa "Các bàn bị trùng lịch", hiển thị rõ cho người dùng
      if (err?.message && err.message.includes('Các bàn bị trùng lịch')) {
        message.error(err.message);
      } else {
        message.error(err?.message || err?.response?.data?.message || 'Lỗi khi cập nhật thông tin');
      }
    }
    setUpdating(false);
  };

  const handleOpenEditModal = (reservation) => {
    setEditModal({ open: true, data: reservation });
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.resetFields();
      }
    }, 0);
  };

  const columns = [
    { title: 'Mã đặt bàn', dataIndex: 'reservationCode', key: 'reservationCode' },
    { title: 'Khách', key: 'customer', render: (v, r) => getCustomer(r)?.fullname || '---' },
    { title: 'SĐT', key: 'phone', render: (v, r) => getCustomer(r)?.phone || '---' },
    { title: 'Bàn', dataIndex: 'bookedTable', key: 'bookedTable', render: t => t?.map(tb => `Bàn ${tb.tableNumber}`).join(', ') },
    { title: 'Thời gian', dataIndex: 'startTime', key: 'startTime', render: (v, r) => `${new Date(r.startTime).toLocaleString()} - ${new Date(r.endTime).toLocaleString()}` },
    { title: 'Số người', dataIndex: 'numberOfPeople', key: 'numberOfPeople' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: v => <Tag color={v === 'completed' ? 'green' : v === 'cancelled' ? 'red' : v === 'served' ? 'orange' : v === 'pending' ? 'gray' : 'blue'}>{v}</Tag> },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    {
      title: 'Tác vụ',
      key: 'actions',
      render: (_, r) => (
        <>
          <Button size="small" onClick={() => setDetailModal({ open: true, data: r })} style={{ marginRight: 8 }}>Chi tiết</Button>
          {r.status === 'confirmed' && <Button size="small" type="primary" onClick={() => handleOpenEditModal(r)} style={{ marginRight: 8 }}>Sửa</Button>}
          {r.status === 'pending' && <Button size="small" type="primary" onClick={() => handleStatusChange(r._id, 'confirmed')} style={{ marginRight: 8 }}>Xác nhận</Button>}
          {r.status === 'confirmed' && <Button size="small" danger onClick={() => handleStatusChange(r._id, 'cancelled')} style={{ marginRight: 8 }}>Huỷ</Button>}
          {r.status === 'confirmed' && new Date(r.startTime) <= new Date() && new Date() <= new Date(r.endTime) && <Button size="small" type="primary" onClick={() => handleStatusChange(r._id, 'served')}>Xác nhận khách đến</Button>}
        </>
      )
    }
  ];

  // Đảm bảo allTables luôn là mảng
  const safeTables = Array.isArray(allTables) ? allTables : [];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Quản lý đơn đặt bàn</Title>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <Tabs
            activeKey={statusFilter}
            onChange={setStatusFilter}
            items={statusTabs}
            style={{ flex: 1 }}
          />
          <Input.Search
            placeholder="Tìm mã đặt bàn, tên hoặc SĐT"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{ marginLeft: 8 }}
          />
        </div>
        <Table
          dataSource={filteredReservations}
          columns={columns}
          rowKey={r => r._id}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
      {/* Modal chi tiết reservation */}
      <Modal
        open={detailModal.open}
        title={`Chi tiết đơn đặt bàn: ${detailModal.data?.reservationCode || ''}`}
        onCancel={() => setDetailModal({ open: false, data: null })}
        footer={null}
        width={600}
      >
        {detailModal.data && (
          <div>
            <div><b>Khách:</b> {getCustomer(detailModal.data)?.fullname || '---'}</div>
            <div><b>SĐT:</b> {getCustomer(detailModal.data)?.phone || '---'}</div>
            <div><b>Bàn:</b> {detailModal.data.bookedTable?.map(tb => `Bàn ${tb.tableNumber}`).join(', ')}</div>
            <div><b>Thời gian:</b> {new Date(detailModal.data.startTime).toLocaleString()} - {new Date(detailModal.data.endTime).toLocaleString()}</div>
            <div><b>Số người:</b> {detailModal.data.numberOfPeople}</div>
            <div><b>Trạng thái:</b> <Tag color={detailModal.data.status === 'completed' ? 'green' : detailModal.data.status === 'cancelled' ? 'red' : 'blue'}>{detailModal.data.status}</Tag></div>
            <div><b>Ghi chú:</b> {detailModal.data.note}</div>
            <div style={{ marginTop: 16 }}>
              {detailModal.data.status === 'pending' && <Button type="primary" style={{ marginRight: 8 }} onClick={() => handleStatusChange(detailModal.data._id, 'confirmed')}>Xác nhận</Button>}
              {detailModal.data.status === 'confirmed' && <Button danger style={{ marginRight: 8 }} onClick={() => handleStatusChange(detailModal.data._id, 'cancelled')}>Huỷ</Button>}
              {detailModal.data.status === 'confirmed' && new Date(detailModal.data.startTime) <= new Date() && new Date() <= new Date(detailModal.data.endTime) && <Button type="primary" onClick={() => handleStatusChange(detailModal.data._id, 'served')}>Xác nhận khách đến</Button>}
            </div>
          </div>
        )}
      </Modal>
      {/* Modal sửa reservation */}
      <Modal
        open={editModal.open}
        title="Sửa thông tin đặt bàn"
        onCancel={() => setEditModal({ open: false, data: null })}
        footer={null}
        width={480}
      >
        {editModal.data && (
          <Form
            ref={editFormRef}
            layout="vertical"
            initialValues={{
              numberOfPeople: editModal.data.numberOfPeople,
              note: editModal.data.note,
              bookedTable: Array.isArray(editModal.data.bookedTable) ? editModal.data.bookedTable.map(tb => tb._id) : [],
              startTime: editModal.data.startTime ? dayjs(editModal.data.startTime) : null,
            }}
            onFinish={values => {
              const payload = {};
              if (values.startTime) {
                const startTimeDayjs = dayjs(values.startTime);
                if (startTimeDayjs.isValid()) {
                  payload.startTime = startTimeDayjs.utc().toISOString();
                  // Tự động set endTime = startTime + 2h
                  payload.endTime = startTimeDayjs.add(2, 'hour').utc().toISOString();
                }
              }
              if (values.numberOfPeople !== undefined && values.numberOfPeople !== editModal.data.numberOfPeople) {
                payload.numberOfPeople = values.numberOfPeople;
              }
              if (values.note !== undefined && values.note !== editModal.data.note) {
                payload.note = values.note;
              }
              if (Array.isArray(values.bookedTable) && JSON.stringify(values.bookedTable) !== JSON.stringify((editModal.data.bookedTable || []).map(tb => tb._id))) {
                payload.bookedTable = values.bookedTable;
              }
              handleEdit(editModal.data._id, payload);
            }}
          >
            <Form.Item label="Số người" name="numberOfPeople"><Input type="number" min={1} /></Form.Item>
            <Form.Item label="Ghi chú" name="note"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item label="Chọn bàn" name="bookedTable"><Select mode="multiple" options={safeTables.map(tb => ({ value: tb._id, label: `Bàn ${tb.tableNumber}` }))} placeholder="Chọn bàn" /></Form.Item>
            <Form.Item label="Thời gian bắt đầu" name="startTime"><DatePicker showTime format="DD/MM/YYYY HH:mm" /></Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updating}>Lưu</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ReservationManage; 