import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Switch,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  Image,
  Descriptions,
  Divider,
  Badge,
  Tooltip,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
  FileImageOutlined,
  DollarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import foodService from '../../services/food.service';
import '../../pages/Food_Manage/index.css';

const { Option } = Select;
const { TextArea } = Input;

const FoodManage = () => {
  const [foods, setFoods] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [fileList, setFileList] = useState([]);
  
  const [form] = Form.useForm();
  const modalLockRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    
    loadData();
    
    // Cleanup function to prevent state update if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodsRes, categoriesRes] = await Promise.all([
        foodService.getAllFoods(),
        foodService.getAllFoodCategories()
      ]);
      
      setFoods(foodsRes || []);
      setFoodCategories(categoriesRes || []);

      
      
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (food = null, event = null) => {
    // Prevent event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
    }
    
    // Prevent opening modal if already open or locked
    if (modalVisible || modalLockRef.current) return;
    
    // Lock modal for 500ms to prevent double clicks
    modalLockRef.current = true;
    setTimeout(() => {
      modalLockRef.current = false;
    }, 500);
    
    setEditingFood(food);
    setModalVisible(true);
    
    if (food) {
      form.setFieldsValue({
        name: food.name,
        description: food.description,
        price: food.price,
        categoryId: food.categoryId?._id || food.categoryId,
        isAvailable: food.isAvailable
      });
      
      if (food.images && food.images.length > 0) {
        const imageFiles = food.images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}.png`,
          status: 'done',
          url: url,
        }));
        setFileList(imageFiles);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ isAvailable: true });
      setFileList([]);
    }
  };

  const showDetailModal = (food) => {
    setSelectedFood(food);
    setDetailModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setEditingFood(null);
    setSelectedFood(null);
    setFileList([]);
    form.resetFields();
    setSubmitting(false);
    // Reset modal lock when closing
    modalLockRef.current = false;
  };

  const handleSubmit = async (values) => {
    // Ngăn submit nếu đang xử lý
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Kiểm tra trùng tên món ăn
      const existingFood = foods.find(food => 
        food.name.toLowerCase() === values.name.toLowerCase() && 
        food._id !== editingFood?._id
      );
      
      if (existingFood) {
        message.error(`❌ Tên món ăn "${values.name}" đã tồn tại! Vui lòng chọn tên khác.`);
        return;
      }
      
      const formData = new FormData();
      
      // Thêm các fields cơ bản vào formData
      formData.append('name', values.name || '');
      formData.append('description', values.description || '');
      formData.append('price', values.price || 0);
      formData.append('categoryId', values.categoryId || '');
      formData.append('isAvailable', values.isAvailable ?? true);

      if (editingFood) {
        // Khi cập nhật: phân biệt ảnh cũ và ảnh mới
        const oldImages = fileList.filter(file => file.url && !file.originFileObj);
        const newImages = fileList.filter(file => file.originFileObj);
        
        // Gửi danh sách ảnh cũ cần giữ lại
        const keepOldImages = oldImages.map(file => file.url);
        formData.append('keepOldImages', JSON.stringify(keepOldImages));
        
        // Gửi ảnh mới
        newImages.forEach((file) => {
          formData.append('images', file.originFileObj);
        });
        
        const response = await foodService.updateFood(editingFood._id, formData);
        message.success('Cập nhật món ăn thành công!');
      } else {
        // Khi tạo mới: chỉ gửi ảnh mới
        const newImages = fileList.filter(file => file.originFileObj);
        newImages.forEach((file) => {
          formData.append('images', file.originFileObj);
        });
        
        const response = await foodService.createFood(formData);
        message.success('Tạo món ăn thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      setEditingFood(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await foodService.deleteFood(id);
      message.success('Xóa món ăn thành công!');
      fetchData();
    } catch (error) {
      console.error('Error deleting food:', error);
      message.error('Không thể xóa món ăn');
    }
  };

  const handleToggleAvailability = async (foodId, currentStatus) => {
    try {
      // Chỉ gửi JSON data khi toggle status, không dùng FormData
      const updateData = {
        isAvailable: !currentStatus
      };
      
      const response = await foodService.updateFood(foodId, updateData);
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} món ăn thành công!`);
      fetchData();
    } catch (error) {
      console.error('Error toggling food availability:', error);
      message.error('Không thể thay đổi trạng thái món ăn');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const beforeUpload = (file) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp'
    ];
    const isValidType = allowedTypes.includes(file.type);
    
    if (!isValidType) {
      message.error(`❌ File "${file.name}" không phải là ảnh! Chỉ chấp nhận: JPG, PNG, GIF, WebP`);
      return false; // Ngăn file được upload
    }
    
    // Kiểm tra kích thước file
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(`❌ File "${file.name}" quá lớn! Kích thước phải nhỏ hơn 5MB`);
      return false;
    }
    
    // Kiểm tra số lượng file
    if (fileList.length >= 5) {
      message.warning('⚠️ Chỉ được tải tối đa 5 ảnh!');
      return false;
    }
    
    message.success(`✅ File "${file.name}" hợp lệ`);
    return false; // Prevent auto upload
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Lọc ra những file hợp lệ
    const validFiles = newFileList.filter(file => {
      // Giữ lại file cũ (đã có url)
      if (file.url) return true;
      
      // Kiểm tra file mới
      if (file.originFileObj) {
        const allowedTypes = [
          'image/jpeg', 
          'image/jpg', 
          'image/png', 
          'image/gif', 
          'image/webp'
        ];
        return allowedTypes.includes(file.originFileObj.type) && 
               file.originFileObj.size / 1024 / 1024 < 5;
      }
      
      return true;
    });
    
    setFileList(validFiles.slice(-5)); // Giới hạn tối đa 5 ảnh
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          {images && images.length > 0 ? (
            <Image
              width={60}
              height={60}
              src={images[0]}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={{
                src: images[0]
              }}
            />
          ) : (
            <div style={{ 
              width: 60, 
              height: 60, 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileImageOutlined style={{ color: '#ccc', fontSize: '20px' }} />
            </div>
          )}
          {images && images.length > 1 && (
            <Badge count={`+${images.length - 1}`} style={{ backgroundColor: '#52c41a' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Tên món ăn',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: ['categoryId', 'title'],
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category || 'Chưa phân loại'}</Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      render: (isAvailable, record) => (
        <Switch
          checked={isAvailable}
          onChange={() => handleToggleAvailability(record._id, isAvailable)}
          checkedChildren="Có sẵn"
          unCheckedChildren="Hết hàng"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={(e) => showModal(record, e)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa món ăn này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarOutlined style={{ color: '#1890ff' }} />
            <span>Quản lý món ăn</span>
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
              onClick={(e) => showModal(null, e)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderColor: '#667eea',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }}
            >
              Thêm món ăn
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={foods}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} món ăn`,
          }}
          locale={{
            emptyText: <Empty description="Chưa có món ăn nào" />
          }}
        />
      </Card>

      {/* Modal thêm/sửa món ăn */}
      <Modal
        title={editingFood ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Spin spinning={submitting} tip="Đang lưu món ăn...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isAvailable: true }}
          >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên món ăn"
                rules={[{ required: true, message: 'Vui lòng nhập tên món ăn!' }]}
              >
                <Input placeholder="Nhập tên món ăn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục">
                  {foodCategories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá (VNĐ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá!' },
                  { type: 'number', min: 0, message: 'Giá phải lớn hơn 0!' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập giá món ăn"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isAvailable"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có sẵn" unCheckedChildren="Hết hàng" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả món ăn"
            />
          </Form.Item>

          <Form.Item label="Hình ảnh (Tối đa 5 ảnh)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleUploadChange}
              multiple
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel} disabled={submitting}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderColor: '#667eea'
                }}
              >
                {submitting 
                  ? 'Đang xử lý...' 
                  : (editingFood ? 'Cập nhật' : 'Tạo mới')
                }
              </Button>
            </Space>
          </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal chi tiết món ăn */}
      <Modal
        title="Chi tiết món ăn"
        open={detailModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedFood && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tên món ăn" span={2}>
                <strong>{selectedFood.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="blue">
                  {selectedFood.categoryId?.title || 'Chưa phân loại'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                  {formatPrice(selectedFood.price)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Badge 
                  status={selectedFood.isAvailable ? "success" : "error"} 
                  text={selectedFood.isAvailable ? "Có sẵn" : "Hết hàng"} 
                />
              </Descriptions.Item>
              {selectedFood.description && (
                <Descriptions.Item label="Mô tả" span={2}>
                  {selectedFood.description}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedFood.images && selectedFood.images.length > 0 && (
              <>
                <Divider>Hình ảnh</Divider>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedFood.images.map((image, index) => (
                    <Image
                      key={index}
                      width={100}
                      height={100}
                      src={image}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FoodManage; 