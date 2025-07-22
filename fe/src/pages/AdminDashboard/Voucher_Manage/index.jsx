import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Spin,
  Select,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileAddOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import couponService from '../../../services/coupon.service';
import './index.css';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Map lại dữ liệu từ BE sang FE theo model mới
const mapCouponData = (raw) => ({
  _id: raw._id,
  coupon_code: raw.coupon_code,
  coupon_name: raw.coupon_name,
  description: raw.description,
  discount_type: raw.discount_type,
  discount_value: raw.discount_value,
  quantity: raw.quantity,
  point_required: raw.point_required,
  is_active: raw.is_active,
  applicable_for: raw.applicable_for,
  valid_from: raw.valid_from,
  valid_to: raw.valid_to,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

const VoucherManage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await couponService.getAllCoupons();
      // Map lại dữ liệu cho table
      const mapped = (res.data || res || []).map(mapCouponData);
      setCoupons(mapped);
    } catch (error) {
      message.error('Không thể tải dữ liệu voucher');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (coupon = null) => {
    setEditingCoupon(coupon);
    setModalVisible(true);
    if (coupon) {
      form.setFieldsValue({
        ...coupon,
        validRange: [coupon.valid_from ? moment(coupon.valid_from) : null, coupon.valid_to ? moment(coupon.valid_to) : null]
      });
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCoupon(null);
    form.resetFields();
    setSubmitting(false);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const data = {
        coupon_code: values.coupon_code,
        coupon_name: values.coupon_name,
        description: values.description,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        quantity: values.quantity,
        point_required: values.point_required || 0,
        valid_from: values.validRange ? values.validRange[0] : null,
        valid_to: values.validRange ? values.validRange[1] : null,
        is_active: values.is_active,
        applicable_for: values.applicable_for
      };
      
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, data);
        message.success('Cập nhật voucher thành công!');
      } else {
        await couponService.createCoupon(data);
        message.success('Tạo voucher thành công!');
      }
      handleCancel();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      message.success('Xóa voucher thành công!');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa voucher');
    }
  };

  const handleToggleStatus = async (couponId, currentStatus) => {
    try {
      await couponService.updateCoupon(couponId, { is_active: !currentStatus });
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} voucher thành công!`);
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái voucher');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'coupon_code',
      key: 'coupon_code',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên',
      dataIndex: 'coupon_name',
      key: 'coupon_name',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'discount_type',
      key: 'discount_type',
      render: (type) => type === 'percent' ? 
        <Tag icon={<PercentageOutlined />} color="green">Phần trăm</Tag> : 
        <Tag icon={<DollarOutlined />} color="orange">Số tiền</Tag>
    },
    {
      title: 'Giá trị',
      dataIndex: 'discount_value',
      key: 'discount_value',
      render: (value, record) => record.discount_type === 'percent' ? 
        `${value ?? 0}%` : 
        (value != null ? `${value.toLocaleString()}₫` : '-')
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (value) => value || 0,
    },
    {
      title: 'Điểm đổi',
      dataIndex: 'point_required',
      key: 'point_required',
      render: (value) => value || 0,
    },
    {
      title: 'Hiệu lực',
      dataIndex: 'valid_from',
      key: 'valid_from',
      render: (v, record) => `${v ? new Date(v).toLocaleDateString() : ''} - ${record.valid_to ? new Date(record.valid_to).toLocaleDateString() : ''}`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => active ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Vô hiệu hóa</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.is_active ? "Vô hiệu hóa voucher" : "Kích hoạt voucher"}>
            <Switch
              checked={record.is_active}
              onChange={() => handleToggleStatus(record._id, record.is_active)}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Tooltip>
          <Tooltip title="Sửa voucher">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa voucher">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa voucher này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                ghost
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="voucher-manage-container">
      <Card className="page-header-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FileAddOutlined className="title-icon" />
              Quản lý Voucher
            </h1>
            <p className="page-subtitle">Quản lý các voucher/coupon trong hệ thống</p>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="add-btn"
            >
              Thêm Voucher Mới
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="_id"
          loading={loading}
          className="voucher-table"
          pagination={{
            total: coupons.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} voucher`,
          }}
          locale={{
            emptyText: (
              <Empty 
                description="Chưa có voucher nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal Thêm/Sửa Voucher */}
      <Modal
        title={
          <div className="modal-title">
            <FileAddOutlined />
            {editingCoupon ? 'Sửa Voucher' : 'Thêm Voucher Mới'}
          </div>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        className="voucher-modal"
      >
        <Spin spinning={submitting} tip="Đang lưu voucher...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="voucher-form"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="coupon_code"
                  label="Mã Voucher"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã voucher!' },
                    { pattern: /^[A-Z0-9_]+$/, message: 'Mã voucher chỉ chứa chữ hoa, số và dấu gạch dưới!' }
                  ]}
                >
                  <Input placeholder="Nhập mã voucher (VD: SAVE20)" style={{ textTransform: 'uppercase' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="coupon_name"
                  label="Tên Voucher"
                  rules={[{ required: true, message: 'Vui lòng nhập tên voucher!' }]}
                >
                  <Input placeholder="Nhập tên voucher" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={3} placeholder="Nhập mô tả voucher" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="discount_type"
                  label="Loại giảm giá"
                  rules={[{ required: true, message: 'Chọn loại giảm giá!' }]}
                >
                  <Select placeholder="Chọn loại giảm giá">
                    <Option value="percent">Phần trăm (%)</Option>
                    <Option value="amount">Số tiền (VND)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discount_value"
                  label="Giá trị giảm"
                  rules={[
                    { required: true, message: 'Nhập giá trị giảm!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        const discountType = getFieldValue('discount_type');
                        if (discountType === 'percent' && value > 100) {
                          return Promise.reject(new Error('Giá trị giảm theo % không được vượt quá 100%!'));
                        }
                        return Promise.resolve();
                      },
                    })
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị giảm"
                    style={{ width: '100%' }}
                    min={0}
                    max={form.getFieldValue('discount_type') === 'percent' ? 100 : undefined}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label="Số lượng voucher"
                  rules={[{ required: true, message: 'Nhập số lượng voucher!' }]}
                >
                  <InputNumber
                    placeholder="Nhập số lượng voucher"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="point_required"
                  label="Điểm cần thiết để đổi"
                  initialValue={0}
                >
                  <InputNumber
                    placeholder="Nhập số điểm cần thiết (0 = miễn phí)"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="applicable_for"
              label="Áp dụng cho"
              initialValue="all"
            >
              <Select placeholder="Chọn đối tượng áp dụng">
                <Option value="all">Tất cả</Option>
                <Option value="new_customer">Khách mới</Option>
                <Option value="loyalty">Khách thân thiết</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="validRange"
              label="Thời gian hiệu lực"
              rules={[{ required: true, message: 'Chọn thời gian hiệu lực!' }]}
            >
              <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="is_active"
              label="Trạng thái"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Vô hiệu hóa" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ width: '100%' }}>
                {editingCoupon ? 'Cập nhật Voucher' : 'Tạo Voucher'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default VoucherManage; 