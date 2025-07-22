import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Row, Col, Card, Carousel, Divider, Tabs, Alert } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MinimalLogo } from '../../components/Logo';
import { foodService } from '../../services/food.service';
import { foodCategoryService } from '../../services/foodCategory.service';
import comboService from '../../services/combo.service';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { TabPane } = Tabs;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data từ API
      const [categoriesData, foodsData, combosData] = await Promise.all([
        foodCategoryService.getAllFoodCategories(),
        foodService.getAllFoods(),
        comboService.getAllCombos()
      ]);

      console.log('Categories loaded:', categoriesData);
      console.log('Foods loaded:', foodsData);
      console.log('Combos loaded:', combosData);

      setCategories(categoriesData || []);
      setFoods(foodsData || []);
      setCombos(combosData || []);

      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays
      setCategories([]);
      setFoods([]);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodClick = (food) => {
    navigate(`/food/${food._id}`);
  };

  const handleComboClick = (combo) => {
    navigate(`/combo/${combo._id}`);
  };

  // Custom carousel component for 3 items per slide
  const CustomCarousel = ({ items, renderItem, title }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(items.length / itemsPerSlide);

    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const getCurrentItems = () => {
      const startIndex = currentSlide * itemsPerSlide;
      return items.slice(startIndex, startIndex + itemsPerSlide);
    };

    if (items.length === 0) return null;

    return (
      <div style={{ position: 'relative' }}>
        {/* Title centered */}
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>{title}</Title>
        
        {/* Navigation arrows positioned at sides of cards */}
        <div style={{ position: 'relative' }}>
          {totalSlides > 1 && (
            <>
              <Button 
                type="text" 
                icon={<LeftOutlined />} 
                onClick={prevSlide}
                style={{ 
                  position: 'absolute',
                  left: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  borderRadius: '50%', 
                  width: 40, 
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <Button 
                type="text" 
                icon={<RightOutlined />} 
                onClick={nextSlide}
                style={{ 
                  position: 'absolute',
                  right: -60,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  borderRadius: '50%', 
                  width: 40, 
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
            </>
          )}

          <Row gutter={[16, 16]}>
            {getCurrentItems().map((item, index) => (
              <Col xs={24} sm={12} md={8} key={item._id || index}>
                {renderItem(item)}
              </Col>
            ))}
          </Row>
        </div>

        {totalSlides > 1 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: 20,
            display: 'flex',
            justifyContent: 'center',
            gap: 8
          }}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: currentSlide === index ? '#1890ff' : '#d9d9d9',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFoodItems = () => {
    const filteredFoods = selectedCategory 
      ? foods.filter(food => food.categoryId === selectedCategory || food.categoryId?._id === selectedCategory)
      : foods;
    
    return (
      <Row gutter={[16, 16]}>
        {filteredFoods.map(food => (
          <Col xs={24} sm={12} md={8} key={food._id}>
            <Card
              hoverable
              cover={
                <img 
                  alt={food.name} 
                  src={food.images && food.images.length > 0 ? food.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'} 
                  style={{ height: 200, objectFit: 'cover' }} 
                />
              }
              onClick={() => handleFoodClick(food)}
              style={{ cursor: 'pointer' }}
            >
              <Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {food.name}
                    </span>
                    <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                      {food.price?.toLocaleString('vi-VN')}đ
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
                        <Text type="danger" strong>Hết món</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderComboCard = (combo) => (
    <Card
      hoverable
      cover={
        <img 
          alt={combo.name} 
          src={combo.image || 'https://via.placeholder.com/300x200?text=Combo'} 
          style={{ height: 200, objectFit: 'cover' }} 
        />
      }
      onClick={() => handleComboClick(combo)}
      style={{ cursor: 'pointer' }}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {combo.name}
            </span>
            <span style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
              {combo.price?.toLocaleString('vi-VN')}đ
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
              {combo.description}
            </Text>
            {!combo.isActive && (
              <div style={{ marginTop: 8 }}>
                <Text type="danger" strong>Không có sẵn</Text>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );

  return (
    <>
      {/* Banner */}
      <Carousel autoplay>
        <div>
          <div style={{ height: '500px', color: '#fff', background: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=500&fit=crop) center/cover no-repeat' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '0 50px' 
            }}>
              <MinimalLogo 
                style={{
                  color: '#fff'
                }}
                showTagline={false}
              />
              <Title level={3} style={{ color: '#fff', marginTop: 0 }}>Nơi hội tụ tinh hoa ẩm thực</Title>
              <Button type="primary" size="large" onClick={() => navigate('/test-table-order')}>
                Đặt bàn ngay
              </Button>
            </div>
          </div>
        </div>
        <div>
          <div style={{ height: '500px', color: '#fff', background: 'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=500&fit=crop) center/cover no-repeat' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '0 50px' 
            }}>
              <Title style={{ color: '#fff' }}>Trải nghiệm ẩm thực đỉnh cao</Title>
              <Title level={3} style={{ color: '#fff', marginTop: 0 }}>Với các món ăn đặc sắc</Title>
              <Button type="primary" size="large" onClick={() => document.getElementById('combo').scrollIntoView({ behavior: 'smooth' })}>
                Xem combo
              </Button>
            </div>
          </div>
        </div>
      </Carousel>

      {/* Giới thiệu */}
      <div style={{ padding: '50px 50px', background: '#fff' }}>
        <Row gutter={32} align="middle">
          <Col xs={24} md={12}>
            <Title>Về nhà hàng chúng tôi</Title>
            <Paragraph style={{ fontSize: 16 }}>
              <strong>The Fool Restaurant</strong> tự hào mang đến cho quý khách những trải nghiệm ẩm thực đẳng cấp với các món ăn được chế biến từ nguyên liệu tươi ngon nhất.
            </Paragraph>
            <Paragraph style={{ fontSize: 16 }}>
              Với không gian sang trọng và đội ngũ nhân viên chuyên nghiệp, chúng tôi cam kết mang đến cho quý khách những giây phút thư giãn và tận hưởng ẩm thực tuyệt vời.
            </Paragraph>
            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Địa điểm</Text>
                  <br />
                  <Text>FPT University, Hòa Lạc</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <PhoneOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Liên hệ</Text>
                  <br />
                  <Text>0904 628 569</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  <br />
                  <Text strong>Giờ mở cửa</Text>
                  <br />
                  <Text>10:00 - 22:00</Text>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={12}>
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" 
              alt="Nhà hàng" 
              style={{ width: '100%', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
            />
          </Col>
        </Row>
      </div>

      {/* Promotion Banner - Moved here */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)', 
        padding: '15px 50px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => navigate('/voucher')}
      >
        <Row align="middle" justify="center" gutter={16}>
          <Col>
            <GiftOutlined style={{ fontSize: 24, color: 'white' }} />
          </Col>
          <Col>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              🎉 Ưu đãi đặc biệt! - Nhấn để xem chi tiết
            </Text>
          </Col>
        </Row>
      </div>

      {/* Combo đặc biệt */}
      {combos.length > 0 && (
        <div id="combo" style={{ padding: '50px 50px', background: '#f5f5f5' }}>
          <CustomCarousel
            items={combos}
            renderItem={renderComboCard}
            title="Combo đặc biệt"
          />
        </div>
      )}

      {/* Thực đơn */}
      <div id="menu" style={{ padding: '50px 50px', background: '#fff' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Thực đơn theo danh mục</Title>
        
        {categories.length > 0 ? (
          <Tabs 
            centered 
            activeKey={selectedCategory} 
            onChange={setSelectedCategory}
          >
            {categories.map(category => (
              <TabPane tab={category.title} key={category._id}>
                {renderFoodItems()}
              </TabPane>
            ))}
          </Tabs>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Đang tải dữ liệu thực đơn...</Text>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Button type="primary" size="large" onClick={() => navigate('/menu')}>
            Xem Menu
          </Button>
        </div>
      </div>
    </>
  );
};

export default HomePage;