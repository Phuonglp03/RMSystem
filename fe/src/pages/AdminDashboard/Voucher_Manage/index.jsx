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
  Select
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

// Map lại dữ liệu từ BE sang FE
const mapCouponData = (raw) => ({
  _id: raw._id,
  couponCode: raw.Code || raw.couponCode,
  couponName: raw.Description || raw.couponName,
  description: raw.Description || raw.description,
  discountType: raw.Discount_Type || raw.discountType,
  discountValue: raw.Discount_Value || raw.discountValue,
  minOrderAmount: raw.minOrderAmount,
  maxDiscountAmount: raw.maxDiscountAmount,
  usageLimit: raw.Quality || raw.usageLimit,
  usedCount: raw.usedCount,
  isActive: raw.isActive,
  applicableFor: raw.applicableFor,
  validFrom: raw.Valid_From || raw.validFrom,
  validUntil: raw.Valid_To || raw.validUntil,
  createdAt: raw.Created_At || raw.createdAt,
  updatedAt: raw.Updated_At || raw.updatedAt,
  pointRequired: raw.Point_required,
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
        validRange: [coupon.validFrom ? moment(coupon.validFrom) : null, coupon.validUntil ? moment(coupon.validUntil) : null]
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
        couponCode: values.couponCode,
        couponName: values.couponName,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderAmount: values.minOrderAmount,
        maxDiscountAmount: values.maxDiscountAmount,
        usageLimit: values.usageLimit,
        validFrom: values.validRange ? values.validRange[0] : null,
        validUntil: values.validRange ? values.validRange[1] : null,
        isActive: values.isActive,
        applicableFor: values.applicableFor
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
      await couponService.updateCoupon(couponId, { isActive: !currentStatus });
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} voucher thành công!`);
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái voucher');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'couponCode',
      key: 'couponCode',
      render: (text) => <strong>{text}</strong>,
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
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type) => type === 'percent' ? <Tag icon={<PercentageOutlined />} color="blue">Phần trăm</Tag> : <Tag icon={<DollarOutlined />} color="orange">Số tiền</Tag>
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value, record) => record.discountType === 'percent' ? `${value ?? 0}%` : (value != null ? `${value.toLocaleString()}₫` : '-')
    },
    {
      title: 'Số lượng',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
    },
    {
      title: 'Đã dùng',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      title: 'Điểm đổi',
      dataIndex: 'pointRequired',
      key: 'pointRequired',
    },
    {
      title: 'Hiệu lực',
      dataIndex: 'validFrom',
      key: 'validFrom',
      render: (v, record) => `${v ? new Date(v).toLocaleDateString() : ''} - ${record.validUntil ? new Date(record.validUntil).toLocaleDateString() : ''}`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => active ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Vô hiệu hóa</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isActive ? "Vô hiệu hóa voucher" : "Kích hoạt voucher"}>
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record._id, record.isActive)}
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
          pagination={{
            total: coupons.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} voucher`,
          }}
          className="voucher-table"
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
                  name="couponCode"
                  label="Mã Voucher"
                  rules={[{ required: true, message: 'Vui lòng nhập mã voucher!' }]}
                >
                  <Input placeholder="Nhập mã voucher" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="couponName"
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
                  name="discountType"
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
                  name="discountValue"
                  label="Giá trị giảm"
                  rules={[{ required: true, message: 'Nhập giá trị giảm!' }]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị giảm"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minOrderAmount"
                  label="Tối thiểu đơn (VND)"
                >
                  <InputNumber
                    placeholder="Nhập giá trị tối thiểu đơn"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxDiscountAmount"
                  label="Tối đa giảm (VND)"
                >
                  <InputNumber
                    placeholder="Nhập giá trị tối đa giảm"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="usageLimit"
                  label="Số lượng sử dụng"
                  rules={[{ required: true, message: 'Nhập số lượng sử dụng!' }]}
                >
                  <InputNumber
                    placeholder="Nhập số lượng sử dụng"
                    style={{ width: '100%' }}
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="applicableFor"
                  label="Áp dụng cho"
                >
                  <Select placeholder="Chọn đối tượng áp dụng">
                    <Option value="all">Tất cả</Option>
                    <Option value="new_customer">Khách mới</Option>
                    <Option value="loyalty">Khách thân thiết</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="validRange"
              label="Thời gian hiệu lực"
              rules={[{ required: true, message: 'Chọn thời gian hiệu lực!' }]}
            >
              <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="isActive"
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