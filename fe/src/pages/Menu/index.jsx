import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Spin, Empty, Tag, Typography } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { foodService } from '../../services/food.service';
import { foodCategoryService } from '../../services/foodCategory.service';
import comboService from '../../services/combo.service';
import './Menu.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const Menu = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from API...');
      
      const [foodsData, combosData, categoriesData] = await Promise.all([     
        foodService.getAllFoods(),
        comboService.getAllCombos(),
        foodCategoryService.getAllFoodCategories()
      ]);

      console.log('Foods data:', foodsData);
      console.log('Combos data:', combosData);
      console.log('Categories data:', categoriesData);

      setFoods(foodsData || []);
      setCombos(combosData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleFoodClick = (food) => {
    navigate(`/food/${food._id}`);
  };

  const handleComboClick = (combo) => {
    navigate(`/combo/${combo._id}`);
  };

  const renderFoodCard = (food) => (
    <Col xs={24} sm={12} md={8} key={food._id}>
      <Card
        hoverable
        className="menu-card"
        cover={
          <div 
            className="card-image-container"
            onClick={() => handleFoodClick(food)}
            style={{ cursor: 'pointer' }}
          >
            {food.images && food.images.length > 0 ? (
              <img
                alt={food.name}
                src={food.images[0]}
                className="card-image"
                style={{ height: 200, objectFit: 'cover', width: '100%' }}
              />
            ) : (
              <div className="no-image-placeholder" style={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#f5f5f5' 
              }}>
                <span>Không có ảnh</span>
              </div>
            )}
          </div>
        }
        onClick={() => handleFoodClick(food)}
        style={{ cursor: 'pointer' }}
      >
        <Card.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {food.name}
              </span>
              <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                {formatPrice(food.price)}
              </span>
            </div>
          }
          description={
            <div>
              <Text type="secondary" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {food.description}
              </Text>
              {!food.isAvailable && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="red">Hết món</Tag>
                </div>
              )}
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderComboCard = (combo) => (
    <Col xs={24} sm={12} md={8} key={combo._id}>
      <Card
        hoverable
        className="menu-card combo-card"
        cover={
          combo.image ? (
            <img
              alt={combo.name}
              src={combo.image}
              className="card-image"
              style={{ height: 200, objectFit: 'cover', width: '100%' }}
            />
          ) : (
            <div
              className="card-image-container"
              style={{
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                width: '100%'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 28, letterSpacing: 2 }}>COMBO</span>
              <span style={{ fontWeight: 500, fontSize: 16, marginTop: 8 }}>{combo.name}</span>
            </div>
          )
        }
        onClick={() => handleComboClick(combo)}
        style={{ cursor: 'pointer' }}
      >
        <Card.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {combo.name}
              </span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Tag color="orange">COMBO</Tag>
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                  {formatPrice(combo.price)}
                </span>
              </div>
            </div>
          }
          description={
            <div>
              <Text type="secondary" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {combo.description}
              </Text>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {!combo.isActive && <Tag color="red">Không có sẵn</Tag>}
                {combo.items && combo.items.length > 0 && (
                  <Tag color="blue">{combo.items.length} món</Tag>
                )}
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderFoodsByCategory = (categoryId) => {
    const filteredFoods = foods.filter(food => 
      food.categoryId === categoryId || food.categoryId?._id === categoryId
    );
    
    if (filteredFoods.length === 0) {
      return (
        <Empty 
          description="Chưa có món ăn nào trong danh mục này" 
          className="empty-state"
        />
      );
    }

    return (
      <Row gutter={[16, 16]} className="menu-grid">
        {filteredFoods.map(renderFoodCard)}
      </Row>
    );
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="menu-container" style={{ padding: '20px 50px', background: '#fff', minHeight: '100vh' }}>
      <div className="menu-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1} className="menu-title">
          <StarOutlined className="title-icon" style={{ marginRight: 8 }} />
          Thực Đơn Nhà Hàng
        </Title>
        <Text className="menu-subtitle" style={{ fontSize: 18, color: '#666' }}>
          Khám phá những món ăn ngon và combo hấp dẫn của chúng tôi
        </Text>
      </div>

      <Tabs defaultActiveKey="all" className="menu-tabs" centered>
        {/* Tab Combo đầu tiên */}
        <TabPane tab="Tất Cả" key="all">
          <div className="all-items-section">
            {/* Combo section */}
            <div style={{ marginBottom: 40 }}>
              <Title level={3} style={{ marginBottom: 24 }}>🍱 Combo Đặc Biệt</Title>
              {combos.length > 0 ? (
                <Row gutter={[16, 16]} className="menu-grid">
                  {combos.map(renderComboCard)}
                </Row>
              ) : (
                <Empty description="Chưa có combo nào" />
              )}
            </div>

            {/* Food categories sections */}
            {categories.map(category => {
              const categoryFoods = foods.filter(food => 
                food.categoryId === category._id || food.categoryId?._id === category._id
              );
              
              if (categoryFoods.length === 0) return null;

              return (
                <div key={category._id} style={{ marginBottom: 40 }}>
                  <Title level={3} style={{ marginBottom: 24 }}>🍽️ {category.title}</Title>
                  <Row gutter={[16, 16]} className="menu-grid">
                    {categoryFoods.map(renderFoodCard)}
                  </Row>
                </div>
              );
            })}
          </div>
        </TabPane>
        <TabPane tab="Combo Đặc Biệt" key="combos">
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

        {/* Các tab danh mục món ăn */}
        {categories.map(category => (
          <TabPane tab={category.title} key={category._id}>
            {renderFoodsByCategory(category._id)}
          </TabPane>
        ))}

        {/* Tab tất cả */}
        
      </Tabs>
    </div>
  );
};

export default Menu; 