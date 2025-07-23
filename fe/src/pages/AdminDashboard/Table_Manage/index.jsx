import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, InputNumber, Input, Space, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import tableService from '../../../services/table.service';

const { Title } = Typography;

const TableManage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await tableService.getAllTables();
      setTables(res.data || []);
    } catch (err) {
      message.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTable(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTable(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await tableService.deleteTable(id);
      message.success('Xoá bàn thành công');
      fetchTables();
    } catch (err) {
      message.error('Xoá bàn thất bại');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTable) {
        await tableService.updateTable(editingTable._id, values);
        message.success('Cập nhật bàn thành công');
      } else {
        await tableService.createTable(values);
        message.success('Thêm bàn thành công');
      }
      setModalVisible(false);
      fetchTables();
    } catch (err) {
      message.error('Lưu thông tin bàn thất bại');
    }
  };

  const columns = [
    {
      title: 'Số bàn',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status || 'Hoạt động',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xác nhận xoá bàn này?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý bàn</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm bàn
      </Button>
      <Table columns={columns} dataSource={tables} rowKey="_id" loading={loading} />
      <Modal
        title={editingTable ? 'Cập nhật bàn' : 'Thêm bàn mới'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tableNumber"
            label="Số bàn"
            rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Input placeholder="Hoạt động" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableManage; 