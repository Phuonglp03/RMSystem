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
  ShoppingCartOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;

const ComboManage = () => {
  const [combos, setCombos] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [fileList, setFileList] = useState([]);
  
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

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
      const [comboRes, foodRes] = await Promise.all([
        axios.get('https://rm-system-4tru.vercel.app//combos'),
        axios.get('https://rm-system-4tru.vercel.app//foods')
      ]);
      
      setCombos(comboRes.data.data || []);
      setFoods(foodRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (combo = null) => {
    // Prevent opening modal if already open
    if (modalVisible) return;
    
    setEditingCombo(combo);
    setModalVisible(true);
    
    if (combo) {
      console.log('Editing combo:', combo);
      
      const items = combo.items?.map(item => ({
        foodId: item.foodId?._id || item.foodId,
        quantity: item.quantity
      })) || [];
      
      form.setFieldsValue({
        name: combo.name,
        description: combo.description,
        price: combo.price,
        quantity: combo.quantity,
        items: items
      });
      
      console.log('Items for form:', items);
      
      if (combo.image) {
        setFileList([{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: combo.image,
        }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  };

  const showDetailModal = (combo) => {
    setSelectedCombo(combo);
    setDetailModalVisible(true);
  };

  const showItemModal = (combo) => {
    setSelectedCombo(combo);
    setItemModalVisible(true);
    itemForm.resetFields();
  };

  const handleCancel = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    setItemModalVisible(false);
    setEditingCombo(null);
    setSelectedCombo(null);
    setFileList([]);
    setSubmitting(false);
    form.resetFields();
    itemForm.resetFields();
  };

  const handleSubmit = async (values) => {
    // Ngăn submit nếu đang xử lý
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Kiểm tra trùng tên combo
      const existingCombo = combos.find(combo => 
        combo.name.toLowerCase() === values.name.toLowerCase() && 
        combo._id !== editingCombo?._id
      );
      
      if (existingCombo) {
        message.error(`❌ Tên combo "${values.name}" đã tồn tại! Vui lòng chọn tên khác.`);
        return;
      }
      
      if (values.items && values.items.length > 0) {
        const validItems = values.items.filter(item => item.foodId && item.quantity);
        
        // Kiểm tra món ăn trùng lặp
        const foodIds = validItems.map(item => item.foodId);
        const uniqueFoodIds = [...new Set(foodIds)];
        
        if (foodIds.length !== uniqueFoodIds.length) {
          message.error('Không thể thêm cùng một món ăn nhiều lần vào combo. Vui lòng chọn món ăn khác nhau.');
          return;
        }

        // Kiểm tra số lượng > 0
        for (const item of validItems) {
          if (item.quantity <= 0) {
            message.error('Số lượng mỗi món ăn phải lớn hơn 0.');
            return;
          }
        }
      }

      const formData = new FormData();
      
      formData.append('name', values.name || '');
      formData.append('description', values.description || '');
      formData.append('price', values.price || 0);
      formData.append('quantity', values.quantity || 0);
      
      // Đặt isActive = true cho combo mới, giữ nguyên cho combo cũ
      if (!editingCombo) {
        formData.append('isActive', true);
      }

      // Thêm items nếu có (lọc bỏ items rỗng)
      if (values.items && values.items.length > 0) {
        const validItems = values.items.filter(item => item.foodId && item.quantity);
        if (validItems.length > 0) {
          formData.append('items', JSON.stringify(validItems));
        }
      }

      // Thêm ảnh nếu có
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const url = editingCombo 
        ? `https://rm-system-4tru.vercel.app//combos/${editingCombo._id}`
        : 'https://rm-system-4tru.vercel.app//combos';
      
      const method = editingCombo ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success(editingCombo ? 'Cập nhật combo thành công!' : 'Tạo combo thành công!');
      handleCancel();
      fetchData();
    } catch (error) {
      console.error('Error saving combo:', error);
      console.error('Error response:', error.response?.data);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu combo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://rm-system-4tru.vercel.app//combos/${id}`);
      message.success('Xóa combo thành công!');
      fetchData();
    } catch (error) {
      console.error('Error deleting combo:', error);
      message.error('Có lỗi xảy ra khi xóa combo');
    }
  };

  const handleToggleStatus = async (comboId, currentStatus) => {
    try {
      await axios.put(`https://rm-system-4tru.vercel.app//combos/${comboId}`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      message.success(`${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} combo thành công!`);
      fetchData();
    } catch (error) {
      console.error('Error updating combo status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái combo');
    }
  };

 

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`https://rm-system-4tru.vercel.app//combos/${selectedCombo._id}/items/${itemId}`);
      message.success('Xóa món ăn khỏi combo thành công!');
      fetchData();
    } catch (error) {
      console.error('Error removing item:', error);
      message.error('Có lỗi xảy ra khi xóa món ăn');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Tính tổng giá trị món ăn trong combo
  const calculateItemsValue = (items) => {
    if (!items || items.length === 0 || !foods || foods.length === 0) return 0;
    
    return items.reduce((total, item) => {
      // Kiểm tra item có tồn tại và có đầy đủ thông tin
      if (!item || !item.foodId || !item.quantity) {
        return total;
      }
      
      try {
        const food = typeof item.foodId === 'object' ? item.foodId : foods.find(f => f._id === item.foodId);
        if (food && food.price && typeof food.price === 'number') {
          return total + (food.price * item.quantity);
        }
      } catch (error) {
        console.error('Error processing item in calculateItemsValue:', error, item);
      }
      
      return total;
    }, 0);
  };

  // Tính phần trăm tiết kiệm
  const calculateSavings = (comboPrice, itemsValue) => {
    if (!comboPrice || !itemsValue || itemsValue === 0) return 0;
    
    try {
      const numComboPrice = Number(comboPrice);
      const numItemsValue = Number(itemsValue);
      
      if (isNaN(numComboPrice) || isNaN(numItemsValue) || numItemsValue === 0) return 0;
      
      return Math.round(((numItemsValue - numComboPrice) / numItemsValue) * 100);
    } catch (error) {
      console.error('Error calculating savings:', error);
      return 0;
    }
  };

  const beforeUpload = (file) => {
    // Kiểm tra định dạng file
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
      return false;
    }
    
    // Kiểm tra kích thước file
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(`❌ File "${file.name}" quá lớn! Kích thước phải nhỏ hơn 5MB`);
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
    
    setFileList(validFiles.slice(-1)); // Chỉ giữ 1 ảnh cho combo
  };

  const uploadProps = {
    fileList,
    beforeUpload,
    onChange: handleUploadChange,
    listType: "picture-card",
    accept: "image/*"
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        image ? (
          <Image
            width={60}
            height={60}
            src={image}
            alt="combo"
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b1TVjFo4xWhvgjv8v8waw7oL9n7A/AK8BNwGu8B8BuwVIIEF2TBqEwGBhBDOjGktLdNvd9ep1dXX2e2/N7zN6lNfq17er6n7nvffe"
          />
        ) : (
          <div 
            style={{ 
              width: 60, 
              height: 60, 
              backgroundColor: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 8,
              color: '#ccc'
            }}
          >
            No Image
          </div>
        )
      ),
    },
    {
      title: 'Tên Combo',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: '#2c3e50' }}>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ color: '#7f8c8d' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Badge 
          count={quantity} 
          style={{ backgroundColor: quantity > 0 ? '#52c41a' : '#f5222d' }}
        />
      ),
    },
    {
      title: 'Món ăn',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <span style={{ color: '#3498db' }}>
          {items?.length || 0} món
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isActive ? "Vô hiệu hóa combo" : "Kích hoạt combo"}>
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record._id, record.isActive)}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              style={{
                backgroundColor: record.isActive ? '#52c41a' : '#f5222d'
              }}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
              style={{ borderColor: '#3498db', color: '#3498db' }}
            />
          </Tooltip>
          <Tooltip title="Sửa combo">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              style={{ borderColor: '#f39c12', color: '#f39c12' }}
            />
          </Tooltip>
          <Tooltip title="Xóa combo">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa combo này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                ghost
                icon={<DeleteOutlined />}
                danger
                style={{ borderColor: '#e74c3c', color: '#e74c3c' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="combo-manage-container">
      <Card className="page-header-card">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <ShoppingCartOutlined className="title-icon" />
              Quản lý Combo
            </h1>
            <p className="page-subtitle">Quản lý các combo món ăn trong hệ thống</p>
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
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                borderColor: '#ff6b35',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
            >
              Thêm Combo Mới
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={combos}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: combos.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} combo`,
          }}
          className="combo-table"
        />
      </Card>

      {/* Modal Thêm/Sửa Combo */}
      <Modal
        title={
          <div className="modal-title">
            <ShoppingCartOutlined />
            {editingCombo ? 'Sửa Combo' : 'Thêm Combo Mới'}
          </div>
        }
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        className="combo-modal"
      >
        <Spin spinning={submitting} tip="Đang lưu combo...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="combo-form"
          >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên Combo"
                rules={[{ required: true, message: 'Vui lòng nhập tên combo!' }]}
              >
                <Input placeholder="Nhập tên combo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
              >
                <InputNumber
                  placeholder="Nhập giá"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả combo"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="Ảnh Combo"
          >
            <Upload {...uploadProps}>
              <div className="upload-area">
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải lên ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => {
              const selectedFoodIds = form.getFieldValue('items')?.map(item => item?.foodId).filter(Boolean) || [];
              
              return (
                <>
                  <div className="items-section-header">
                    <label>Món ăn trong combo</label>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Thêm món ăn
                    </Button>
                  </div>
                  {fields.map(({ key, name, ...restField }) => {
                    const currentFoodId = form.getFieldValue(['items', name, 'foodId']);
                    
                    return (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'foodId']}
                          rules={[{ required: true, message: 'Chọn món ăn!' }]}
                        >
                          <Select 
                            placeholder="Chọn món ăn" 
                            style={{ width: 200 }}
                            onChange={() => {
                              form.setFieldsValue({});
                            }}
                          >
                            {foods.map(food => {
                              const isDisabled = selectedFoodIds.includes(food._id) && food._id !== currentFoodId;
                              return (
                                <Option 
                                  key={food._id} 
                                  value={food._id} 
                                  disabled={isDisabled}
                                  title={isDisabled ? 'Món ăn này đã được chọn' : food.name}
                                >
                                  {food.name}
                                  {isDisabled && <span style={{ color: '#ff4d4f' }}> (Đã chọn)</span>}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          rules={[{ required: true, message: 'Nhập số lượng!' }]}
                        >
                          <InputNumber placeholder="Số lượng" min={1} />
                        </Form.Item>
                        <Button type="link" danger onClick={() => remove(name)}>
                          Xóa
                        </Button>
                      </Space>
                    );
                  })}
                </>
              );
            }}
          </Form.List>

          {/* Hiển thị tổng giá trị món ăn */}
          <Form.Item shouldUpdate={(prevValues, currentValues) => 
            JSON.stringify(prevValues.items) !== JSON.stringify(currentValues.items) ||
            prevValues.price !== currentValues.price
          }>
            {({ getFieldValue }) => {
              try {
                const items = getFieldValue('items') || [];
                const comboPrice = getFieldValue('price') || 0;
                
                // Lọc ra những item hợp lệ trước khi tính toán
                const validItems = items.filter(item => 
                  item && item.foodId && item.quantity && item.quantity > 0
                );
                
                if (validItems.length === 0) return null;
                
                const itemsValue = calculateItemsValue(validItems);
                const savings = calculateSavings(comboPrice, itemsValue);
                
                // Chỉ hiển thị khi có dữ liệu hợp lệ
                if (itemsValue === 0) return null;
              
              return (
                <div style={{ 
                  backgroundColor: '#f6f8fa', 
                  padding: '12px', 
                  borderRadius: '6px',
                  border: '1px solid #e1e4e8',
                  marginBottom: '16px'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                  <strong>Giá trị combo:</strong>
                  </div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div>
                        <span style={{ color: '#666' }}>Tổng giá món ăn riêng lẻ:</span>
                        <br />
                        <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                          {formatPrice(itemsValue)}
                        </strong>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <span style={{ color: '#666' }}>Giá combo:</span>
                        <br />
                        <strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                          {formatPrice(comboPrice)}
                        </strong>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div>
                        <span style={{ color: '#666' }}>
                          {comboPrice < itemsValue ? 'Tiết kiệm:' : 'Tăng giá:'}
                        </span>
                        <br />
                        <strong style={{ 
                          color: comboPrice < itemsValue ? '#52c41a' : '#ff4d4f',
                          fontSize: '16px'
                        }}>
                          {comboPrice < itemsValue ? `${savings}%` : `+${Math.abs(savings)}%`}
                          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                            ({formatPrice(Math.abs(itemsValue - comboPrice))})
                          </span>
                        </strong>
                      </div>
                    </Col>
                  </Row>
                </div>
                              );
              } catch (error) {
                console.error('Error calculating combo value:', error);
                return null;
              }
            }}
          </Form.Item>

          <div className="form-actions">
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
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  borderColor: '#ff6b35'
                }}
              >
                {submitting 
                  ? 'Đang xử lý...' 
                  : (editingCombo ? 'Cập nhật' : 'Tạo mới')
                }
              </Button>
            </Space>
          </div>
          </Form>
        </Spin>
      </Modal>

      {/* Modal Chi tiết Combo */}
      <Modal
        title={
          <div className="modal-title">
            <InfoCircleOutlined />
            Chi tiết Combo
          </div>
        }
        visible={detailModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        className="detail-modal"
      >
        {selectedCombo && (
          <div className="combo-detail">
            <Row gutter={24}>
              <Col span={8}>
                {selectedCombo.image ? (
                  <Image
                    width="100%"
                    src={selectedCombo.image}
                    alt={selectedCombo.name}
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>Không có ảnh</span>
                  </div>
                )}
              </Col>
              <Col span={16}>
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Tên Combo">
                    <strong>{selectedCombo.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả">
                    {selectedCombo.description || 'Không có mô tả'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá">
                    <strong style={{ color: '#e74c3c' }}>
                      {formatPrice(selectedCombo.price)}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng">
                    <Badge 
                      count={selectedCombo.quantity} 
                      style={{ 
                        backgroundColor: selectedCombo.quantity > 0 ? '#52c41a' : '#f5222d' 
                      }}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={selectedCombo.isActive ? 'green' : 'red'}>
                      {selectedCombo.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                
                {/* Hiển thị phân tích giá trị */}
                {selectedCombo.items && selectedCombo.items.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#f6f8fa', 
                    padding: '12px', 
                    borderRadius: '6px',
                    border: '1px solid #e1e4e8',
                    marginTop: '16px'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Giá trị combo:</strong>
                    </div>
                    {(() => {
                      try {
                        const itemsValue = calculateItemsValue(selectedCombo.items);
                        const savings = calculateSavings(selectedCombo.price, itemsValue);
                        
                        // Chỉ hiển thị khi có dữ liệu hợp lệ
                        if (itemsValue === 0) return null;
                        
                        return (
                        <Row gutter={16}>
                          <Col span={8}>
                            <div>
                              <span style={{ color: '#666' }}>Tổng giá món ăn riêng lẻ:</span>
                              <br />
                              <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                {formatPrice(itemsValue)}
                              </strong>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div>
                              <span style={{ color: '#666' }}>Giá combo:</span>
                              <br />
                              <strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                                {formatPrice(selectedCombo.price)}
                              </strong>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div>
                              <span style={{ color: '#666' }}>
                                {selectedCombo.price < itemsValue ? 'Tiết kiệm:' : 'Tăng giá:'}
                              </span>
                              <br />
                              <strong style={{ 
                                color: selectedCombo.price < itemsValue ? '#52c41a' : '#ff4d4f',
                                fontSize: '16px'
                              }}>
                                {selectedCombo.price < itemsValue ? `${savings}%` : `+${Math.abs(savings)}%`}
                                <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                                  ({formatPrice(Math.abs(itemsValue - selectedCombo.price))})
                                </span>
                              </strong>
                            </div>
                          </Col>
                        </Row>
                                              );
                      } catch (error) {
                        console.error('Error calculating combo detail value:', error);
                        return null;
                      }
                    })()}
                  </div>
                )}
              </Col>
            </Row>

            <Divider>Món ăn trong combo</Divider>
            
            {selectedCombo.items && selectedCombo.items.length > 0 ? (
              <Row gutter={[16, 16]}>
                {selectedCombo.items.map((item) => (
                  <Col span={8} key={item._id}>
                    <Card
                      size="small"
                      className="item-card"
                      cover={
                        item.foodId.images && item.foodId.images.length > 0 ? (
                          <img
                            alt={item.foodId.name}
                            src={item.foodId.images[0]}
                            style={{ height: 120, objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="no-image-small">
                            No Image
                          </div>
                        )
                      }
                      actions={[
                        <Popconfirm
                          title="Xóa món ăn khỏi combo?"
                          onConfirm={() => handleRemoveItem(item._id)}
                          okText="Có"
                          cancelText="Không"
                        >
                          <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ]}
                    >
                      <Card.Meta
                        title={item.foodId.name}
                        description={
                          <div>
                            <p>Số lượng: <strong>{item.quantity}</strong></p>
                            <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                              {formatPrice(item.foodId.price)}
                            </p>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Chưa có món ăn nào trong combo" />
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ComboManage; 