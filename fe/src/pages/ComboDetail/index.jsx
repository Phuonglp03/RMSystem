import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Divider, 
  Tag, 
  Spin, 
  message,
  Breadcrumb,
  List,
  Avatar
} from 'antd';
import { 
  ArrowLeftOutlined, 
  HeartOutlined, 
  HeartFilled, 
  ShareAltOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import comboService from '../../services/combo.service';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ComboDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchComboDetail();
  }, [id]);

  const fetchComboDetail = async () => {
    try {
      setLoading(true);
      const response = await comboService.getComboById(id);
      console.log('Combo detail response:', response);
      
      // Backend trả về { status: 'success', data: combo }
      const comboData = response.data || response;
      setCombo(comboData);
    } catch (error) {
      console.error('Error fetching combo detail:', error);
      message.error('Không thể tải thông tin combo');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: combo?.name,
        text: combo?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép link combo');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const calculateTotalItemsPrice = () => {
    if (!combo?.items || combo.items.length === 0) return 0;
    
    return combo.items.reduce((total, item) => {
      const itemPrice = item.foodId?.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  const calculateSavings = () => {
    const totalItemsPrice = calculateTotalItemsPrice();
    const comboPrice = combo?.price || 0;
    return totalItemsPrice - comboPrice;
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

  if (!combo) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px' 
      }}>
        <Title level={3}>Không tìm thấy combo</Title>
        <Button type="primary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const savings = calculateSavings();

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
        <Breadcrumb.Item>{combo.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[32, 32]}>
        {/* Hình ảnh combo */}
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{
              width: '100%',
              height: '400px',
              background: combo.image ? 
                `url(${combo.image}) center/cover no-repeat` : 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {!combo.image && (
                <div style={{ textAlign: 'center', color: 'white', width: '100%' }}>
                  <span style={{ fontWeight: 700, fontSize: 40, letterSpacing: 2, display: 'block' }}>COMBO</span>
                  <span style={{ fontWeight: 500, fontSize: 22, marginTop: 12, display: 'block' }}>{combo.name}</span>
                </div>
              )}
              
              {/* Discount badge if there's savings */}
              {savings > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: '#ff4d4f',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontWeight: 'bold',
                  fontSize: 14
                }}>
                  Tiết kiệm {savings.toLocaleString('vi-VN')}đ
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Thông tin combo */}
        <Col xs={24} md={12}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  {combo.name}
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
              <div style={{ marginBottom: 16 }}>
                <Title level={1} style={{ color: '#ff4d4f', margin: 0, display: 'inline-block' }}>
                  {combo.price?.toLocaleString('vi-VN')}đ
                </Title>
                {savings > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text 
                      delete 
                      type="secondary" 
                      style={{ fontSize: 16, marginRight: 8 }}
                    >
                      {calculateTotalItemsPrice().toLocaleString('vi-VN')}đ
                    </Text>
                    <Tag color="red">-{((savings / calculateTotalItemsPrice()) * 100).toFixed(0)}%</Tag>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <Tag color={combo.isActive ? 'green' : 'red'} style={{ marginRight: 8 }}>
                  {combo.isActive ? 'Có sẵn' : 'Không có sẵn'}
                </Tag>
                <Tag color="blue" style={{ marginRight: 8 }}>
                  Combo {combo.items?.length || 0} món
                </Tag>
                {combo.quantity && combo.quantity > 0 && (
                  <Tag color="orange">Còn {combo.quantity} suất</Tag>
                )}
              </div>
            </div>

            {/* Mô tả */}
            <div style={{ marginBottom: 24, flex: 1 }}>
              <Title level={4}>Mô tả combo</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                {combo.description || 'Combo đặc biệt với những món ăn được lựa chọn kỹ càng.'}
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
                      <Text>25-35 phút</Text>
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
                      <Text>{combo.items?.length >= 3 ? '2-4' : '1-2'} người</Text>
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
                    disabled={!combo.isActive}
                    onClick={() => navigate('/test-table-order')}
                  >
                    Đặt combo
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '40px 0' }} />

      {/* Món ăn trong combo */}
      <div>
        <Title level={3}>Món ăn trong combo ({combo.items?.length || 0} món)</Title>
        {combo.items && combo.items.length > 0 ? (
          <Row gutter={[16, 16]}>
            {combo.items.map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  cover={
                    item.foodId?.images && item.foodId.images.length > 0 ? (
                      <img
                        alt={item.foodId.name}
                        src={item.foodId.images[0]}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        height: 200,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Text type="secondary">Chưa có hình ảnh</Text>
                      </div>
                    )
                  }
                  onClick={() => item.foodId?._id && navigate(`/food/${item.foodId._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.foodId?.name || 'Tên món ăn'}
                        </span>
                        <Tag color="blue" style={{ marginLeft: 8 }}>x{item.quantity || 1}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: 8
                        }}>
                          {item.foodId?.description}
                        </Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ color: '#ff4d4f' }}>
                            {item.foodId?.price?.toLocaleString('vi-VN')}đ/món
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            = {((item.foodId?.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Chưa có thông tin món ăn trong combo</Text>
          </div>
        )}
        
        {/* Summary */}
        {combo.items && combo.items.length > 0 && (
          <div style={{ 
            marginTop: 24, 
            padding: 20, 
            background: '#f9f9f9', 
            borderRadius: 8 
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong>Tổng giá trị các món:</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 16 }}>{calculateTotalItemsPrice().toLocaleString('vi-VN')}đ</Text>
              </Col>
            </Row>
            <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
              <Col>
                <Text strong>Giá combo:</Text>
              </Col>
              <Col>
                <Text style={{ fontSize: 16, color: '#ff4d4f' }}>{combo.price?.toLocaleString('vi-VN')}đ</Text>
              </Col>
            </Row>
            {savings > 0 && (
              <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
                <Col>
                  <Text strong style={{ color: '#52c41a' }}>Bạn tiết kiệm:</Text>
                </Col>
                <Col>
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {savings.toLocaleString('vi-VN')}đ ({((savings / calculateTotalItemsPrice()) * 100).toFixed(0)}%)
                  </Text>
                </Col>
              </Row>
            )}
          </div>
        )}
      </div>
    </Content>
  );
};

export default ComboDetail; 