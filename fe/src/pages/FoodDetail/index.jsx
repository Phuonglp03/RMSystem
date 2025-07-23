import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Carousel, 
  Divider, 
  Tag, 
  Spin, 
  message,
  Breadcrumb
} from 'antd';
import { 
  ArrowLeftOutlined, 
  HeartOutlined, 
  HeartFilled, 
  ShareAltOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { foodService } from '../../services/food.service';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchFoodDetail();
  }, [id]);

  const fetchFoodDetail = async () => {
    try {
      setLoading(true);
      const data = await foodService.getFoodById(id);
      setFood(data);
    } catch (error) {
      console.error('Error fetching food detail:', error);
      message.error('Không thể tải thông tin món ăn');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food?.name,
        text: food?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép link món ăn');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!food) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px' 
      }}>
        <Title level={3}>Không tìm thấy món ăn</Title>
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <Content style={{ padding: '20px 50px', background: '#fff' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 20 }}>
        <Breadcrumb.Item>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ padding: 0 }}
          >
            Trang chủ
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Button 
            type="link" 
            onClick={() => navigate('/menu')}
            style={{ padding: 0 }}
          >
            Thực đơn
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{food.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        {/* Hình ảnh món ăn */}
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            {food.images && food.images.length > 0 ? (
              <Carousel autoplay dots={{ position: 'bottom' }}>
                {food.images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={image}
                      alt={`${food.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div style={{
                width: '100%',
                height: '400px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text type="secondary">Chưa có hình ảnh</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Thông tin món ăn */}
        <Col xs={24} md={12}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  {food.name}
                </Title>
                <div>
                  <Button
                    type="text"
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={toggleFavorite}
                    style={{ marginRight: 8 }}
                  />
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                  />
                </div>
              </div>

              {/* Giá */}
              <Title level={1} style={{ color: '#ff4d4f', margin: '16px 0' }}>
                {food.price?.toLocaleString('vi-VN')}đ
              </Title>

              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <Tag color={food.isAvailable ? 'green' : 'red'}>
                  {food.isAvailable ? 'Còn món' : 'Hết món'}
                </Tag>
                {food.categoryId && (
                  <Tag color="blue">{food.categoryId.title || 'Chưa phân loại'}</Tag>
                )}
              </div>
            </div>

            {/* Mô tả */}
            <div style={{ marginBottom: 24, flex: 1 }}>
              <Title level={4}>Mô tả món ăn</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                {food.description || 'Chưa có mô tả cho món ăn này.'}
              </Paragraph>
            </div>

            {/* Thông tin thêm */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Thông tin chi tiết</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ 
                    padding: 16, 
                    background: '#fafafa', 
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                    <div>
                      <Text strong>Thời gian chuẩn bị</Text>
                      <br />
                      <Text>15-20 phút</Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ 
                    padding: 16, 
                    background: '#fafafa', 
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <UserOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                    <div>
                      <Text strong>Phù hợp cho</Text>
                      <br />
                      <Text>1-2 người</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Button 
                    size="large" 
                    block
                    onClick={() => navigate('/book-table')}
                  >
                    Đặt bàn
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    size="large" 
                    block
                    disabled={!food.isAvailable}
                    onClick={() => navigate('/test-table-order')}
                  >
                    Đặt món
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>


    </Content>
  );
};

export default FoodDetail; 