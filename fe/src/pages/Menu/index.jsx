import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Spin, Empty, Tag, Button, Modal, Image, Descriptions, Divider } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Menu.css';

const { TabPane } = Tabs;

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from API...');
      
      const [foodRes, comboRes] = await Promise.all([     
        axios.get('https://rm-system-4tru.vercel.app//foods'),
        axios.get('https://rm-system-4tru.vercel.app//combos'),
      ]);

      console.log('Food API Response:', foodRes);
      console.log('Combo API Response:', comboRes);

      const foodsData = foodRes.data.data || [];
      const combosData = comboRes.data.data || [];

      console.log('Foods data:', foodsData);
      console.log('Combos data:', combosData);

      setFoods(foodsData);
      setCombos(combosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const showDetailModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedItem(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderFoodCard = (food) => (
    <Col xs={24} sm={12} md={8} lg={6} key={food._id}>
      <Card
        hoverable
        className="menu-card"
        cover={
          <div className="card-image-container">
            {food.images && food.images.length > 0 ? (
              <img
                alt={food.name}
                src={food.images[0]}
                className="card-image"
              />
            ) : (
              <div className="no-image-placeholder">
                <span>Không có ảnh</span>
              </div>
            )}
            <div className="card-overlay">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => showDetailModal(food, 'food')}
                className="view-detail-btn"
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        }
        // actions={[
        //   <Button
        //     type="primary"
        //     icon={<ShoppingCartOutlined />}
        //     onClick={() => console.log('Add to cart:', food.name)}
        //   >
        //     Thêm vào giỏ
        //   </Button>
        // ]}
      >
        <Card.Meta
          title={
            <div className="card-title">
              <span>{food.name}</span>
              {!food.isAvailable && (
                <Tag color="red" className="availability-tag">
                  Hết hàng
                </Tag>
              )}
            </div>
          }
          description={
            <div className="card-description">
              <p className="food-description">{food.description}</p>
              <div className="price-section">
                <span className="price">{formatPrice(food.price)}</span>
                {food.categoryId && (
                  <Tag color="blue" className="category-tag">
                    {food.categoryId.name}
                  </Tag>
                )}
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderComboCard = (combo) => (
    <Col xs={24} sm={12} md={8} lg={6} key={combo._id}>
      <Card
        hoverable
        className="menu-card combo-card"
        cover={
          <div className="card-image-container">
            {combo.image ? (
              <img
                alt={combo.name}
                src={combo.image}
                className="card-image"
              />
            ) : (
              <div className="no-image-placeholder">
                <span>Không có ảnh</span>
              </div>
            )}
            <div className="card-overlay">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => showDetailModal(combo, 'combo')}
                className="view-detail-btn"
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        }
        // actions={[
        //   <Button
        //     type="primary"
        //     icon={<ShoppingCartOutlined />}
        //     onClick={() => console.log('Add combo to cart:', combo.name)}
        //   >
        //     Thêm vào giỏ
        //   </Button>
        // ]}
      >
        <Card.Meta
          title={
            <div className="card-title">
              <span>{combo.name}</span>
              <Tag color="orange" className="combo-tag">
                COMBO
              </Tag>
              {!combo.isActive && (
                <Tag color="red" className="availability-tag">
                  Không khả dụng
                </Tag>
              )}
            </div>
          }
          description={
            <div className="card-description">
              <p className="food-description">{combo.description}</p>
              <div className="price-section">
                <span className="price">{formatPrice(combo.price)}</span>
                {combo.quantity && (
                  <Tag color="green" className="quantity-tag">
                    Còn {combo.quantity}
                  </Tag>
                )}
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const { type, ...item } = selectedItem;

    return (
      <Modal
        title={
          <div className="modal-title">
            <span>{item.name}</span>
            {type === 'combo' && (
              <Tag color="orange" className="combo-tag">
                COMBO
              </Tag>
            )}
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          <Button
            key="addToCart"
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              console.log('Add to cart:', item.name);
              handleCloseModal();
            }}
          >
            Thêm vào giỏ hàng
          </Button>
        ]}
        width={600}
      >
        <div className="detail-content">
          {item.images && item.images.length > 0 ? (
            <Image.PreviewGroup>
              <div className="detail-images">
                {item.images.map((image, index) => (
                  <Image
                    key={index}
                    width={120}
                    height={120}
                    src={image}
                    alt={`${item.name} ${index + 1}`}
                    className="detail-image"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          ) : item.image ? (
            <Image
              width="100%"
              height={300}
              src={item.image}
              alt={item.name}
              className="detail-image"
            />
          ) : (
            <div className="no-image-placeholder detail">
              <span>Không có ảnh</span>
            </div>
          )}

          <Divider />

          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên">{item.name}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{item.description}</Descriptions.Item>
            <Descriptions.Item label="Giá">{formatPrice(item.price)}</Descriptions.Item>
            
            {type === 'food' && (
              <>
                {item.categoryId && (
                  <Descriptions.Item label="Danh mục">
                    {item.categoryId.name}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Trạng thái">
                  <Tag color={item.isAvailable ? 'green' : 'red'}>
                    {item.isAvailable ? 'Có sẵn' : 'Hết hàng'}
                  </Tag>
                </Descriptions.Item>
              </>
            )}

            {type === 'combo' && (
              <>
                <Descriptions.Item label="Số lượng còn lại">
                  {item.quantity || 'Không giới hạn'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={item.isActive ? 'green' : 'red'}>
                    {item.isActive ? 'Khả dụng' : 'Không khả dụng'}
                  </Tag>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">
          <StarOutlined className="title-icon" />
          Thực Đơn Nhà Hàng
        </h1>
        <p className="menu-subtitle">
          Khám phá những món ăn ngon và combo hấp dẫn của chúng tôi
        </p>
      </div>

      <Tabs defaultActiveKey="foods" className="menu-tabs">
        <TabPane tab="Món Ăn" key="foods">
          {foods.length > 0 ? (
            <Row gutter={[16, 16]} className="menu-grid">
              {foods.map(renderFoodCard)}
            </Row>
          ) : (
            <Empty
              description="Chưa có món ăn nào"
              className="empty-state"
            />
          )}
        </TabPane>

        <TabPane tab="Combo" key="combos">
          {combos.length > 0 ? (
            <Row gutter={[16, 16]} className="menu-grid">
              {combos.map(renderComboCard)}
            </Row>
          ) : (
            <Empty
              description="Chưa có combo nào"
              className="empty-state"
            />
          )}
        </TabPane>

        <TabPane tab="Tất Cả" key="all">
          <div className="all-items-section">
            <h3 className="section-title">Món Ăn</h3>
            {foods.length > 0 ? (
              <Row gutter={[16, 16]} className="menu-grid">
                {foods.map(renderFoodCard)}
              </Row>
            ) : (
              <Empty description="Chưa có món ăn nào" />
            )}

            <Divider />

            <h3 className="section-title">Combo</h3>
            {combos.length > 0 ? (
              <Row gutter={[16, 16]} className="menu-grid">
                {combos.map(renderComboCard)}
              </Row>
            ) : (
              <Empty description="Chưa có combo nào" />
            )}
          </div>
        </TabPane>
      </Tabs>

      {renderDetailModal()}
    </div>
  );
};

export default Menu; 