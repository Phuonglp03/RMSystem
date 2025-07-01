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
  Space,
  Popconfirm,
  message,
  Tag,
  Descriptions,
  Tooltip,
  Empty,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TagsOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import foodCategoryService from '../../services/foodCategory.service';


const { TextArea } = Input;
const { Title } = Typography;

const FoodCategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [form] = Form.useForm();

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await foodCategoryService.getAllFoodCategories();
      setCategories(categoriesRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (category = null) => {

    if (modalVisible) return;
    
    setEditingCategory(category);
    setModalVisible(true);
    
    if (category) {
      form.setFieldsValue({
        title: category.title,
        description: category.description
      });
    } else {
      form.resetFields();
    }
  };

  const showDetailModal = (category) => {
    setSelectedCategory(category);
    setDetailModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setEditingCategory(null);
    setSelectedCategory(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await foodCategoryService.updateFoodCategory(editingCategory._id, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await foodCategoryService.createFoodCategory(values);
        message.success('Tạo danh mục thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const handleDelete = async (id) => {
    try {
      await foodCategoryService.deleteFoodCategory(id);
      message.success('Xóa danh mục thành công!');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục. Có thể danh mục đang được sử dụng.');
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {title}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => description || <span style={{ color: '#999' }}>Chưa có mô tả</span>,
    },
    
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
              style={{ padding: '4px 8px' }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              style={{ padding: '4px 8px' }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                style={{ padding: '4px 8px' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="category-manage-container">
      <Card
        className="category-manage-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagsOutlined style={{ color: '#1890ff' }} />
            <span>Quản lý danh mục món ăn</span>
          </div>
        }
        extra={
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
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                borderColor: '#52c41a',
                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
              }}
            >
              Thêm danh mục
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} danh mục`,
          }}
          locale={{
            emptyText: (
              <Empty 
                description="Chưa có danh mục nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagsOutlined />
            <span>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        destroyOnClose
        className="category-manage-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="category-form"
        >
          <Form.Item
            name="title"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' },
              { max: 50, message: 'Tên danh mục không được quá 50 ký tự!' }
            ]}
          >
            <Input 
              placeholder="Nhập tên danh mục (VD: Món khai vị, Món chính...)" 
              prefix={<TagsOutlined style={{ color: '#666' }} />}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 200, message: 'Mô tả không được quá 200 ký tự!' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả cho danh mục này..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  borderColor: '#52c41a'
                }}
              >
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined />
            <span>Chi tiết danh mục</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCancel}
        footer={[
          
          <Button key="close" onClick={handleCancel}>
            Đóng
          </Button>
        ]}
        width={500}
        className="category-detail-modal"
      >
        {selectedCategory && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên danh mục">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {selectedCategory.title}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedCategory.description || <span style={{ color: '#999' }}>Chưa có mô tả</span>}
            </Descriptions.Item>
            
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FoodCategoryManage; 