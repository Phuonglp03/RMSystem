import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Button, 
  Tag, 
  Divider,
  Breadcrumb,
  Empty,
  Spin,
  message
} from 'antd';
import { 
  GiftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import couponService from '../../services/coupon.service';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Promotions = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAllCoupons();
      console.log('Coupons response:', response);
      
      // Backend trả về trực tiếp array hoặc có data property
      const couponsData = response.data || response || [];
      console.log('Processed coupons data:', couponsData);
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.error('Không thể tải danh sách ưu đãi');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) {
      message.error('Mã coupon không hợp lệ');
      return;
    }
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return -1;
    const today = moment();
    const endDate = moment(validUntil);
    return endDate.diff(today, 'days');
  };

  const getDiscountText = (coupon) => {
    // Kiểm tra và xử lý safe cho discountValue
    const discountValue = coupon?.discountValue;
    const discountType = coupon?.discountType;
    
    if (!discountValue && discountValue !== 0) {
      return 'N/A';
    }
    
    if (discountType === 'percent') {
      return `${discountValue}%`;
    } else {
      // Đảm bảo discountValue là số
      const numValue = Number(discountValue);
      if (isNaN(numValue)) {
        return 'N/A';
      }
      return `${numValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const getDiscountTypeColor = (discountType) => {
    return discountType === 'percent' ? '#52c41a' : '#faad14';
  };

  const formatMinOrder = (amount) => {
    if (!amount || amount === 0) return 'Không giới hạn';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'Không giới hạn';
    return `${numAmount.toLocaleString('vi-VN')}đ`;
  };

  const renderCouponCard = (coupon) => {
    // Kiểm tra coupon object có đầy đủ thông tin không
    if (!coupon) return null;
    
    const daysRemaining = getDaysRemaining(coupon.validUntil);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;
    const isExpired = daysRemaining < 0;
    
    // Safe access cho các properties
    const couponName = coupon.couponName || 'Tên coupon không có';
    const couponCode = coupon.couponCode || 'CODE';
    const description = coupon.description || 'Mã giảm giá đặc biệt';
    const discountType = coupon.discountType || 'amount';
    const usedCount = coupon.usedCount || 0;
    const usageLimit = coupon.usageLimit || 1;
    const isActive = coupon.isActive !== false; // Default true nếu undefined
    const applicableFor = coupon.applicableFor || 'all';
    
    return (
      <Card
        key={coupon._id || Math.random()}
        hoverable
        style={{ 
          marginBottom: 24,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          opacity: isExpired ? 0.6 : 1
        }}
      >
        <Row gutter={24}>
          {/* Left side - Coupon Visual */}
          <Col xs={24} md={8}>
            <div
              style={{
                width: '100%',
                height: 200,
                background: `linear-gradient(135deg, ${getDiscountTypeColor(discountType)} 0%, #ffd700 100%)`,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 60,
                height: 60,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />
              <div style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />

              <GiftOutlined style={{ fontSize: 32, marginBottom: 12 }} />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                Coupon
              </Text>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                {getDiscountText(coupon)}
              </Text>
              {discountType === 'percent' ? (
                <PercentageOutlined style={{ fontSize: 16, marginLeft: 4 }} />
              ) : (
                <Text style={{ color: 'white', fontSize: 14 }}>OFF</Text>
              )}
            </div>
          </Col>

          {/* Right side - Content */}
          <Col xs={24} md={16}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
                    {couponName}
                  </Title>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Tag color={getDiscountTypeColor(discountType)}>
                      {discountType === 'percent' ? 'Giảm %' : 'Giảm tiền'}
                    </Tag>
                    {isExpired ? (
                      <Tag color="red">Đã hết hạn</Tag>
                    ) : !isActive ? (
                      <Tag color="gray">Tạm dừng</Tag>
                    ) : usedCount >= usageLimit ? (
                      <Tag color="orange">Đã hết lượt</Tag>
                    ) : (
                      <Tag color="green">Có sẵn</Tag>
                    )}
                  </div>
                </div>
                
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {description}
                </Text>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16, flex: 1 }}>
                <Paragraph style={{ fontSize: 15, margin: 0 }}>
                  • Giảm {getDiscountText(coupon)} cho đơn hàng từ {formatMinOrder(coupon.minOrderAmount)}
                  <br />
                  {coupon.maxDiscountAmount && discountType === 'percent' && (
                    <>• Giảm tối đa {Number(coupon.maxDiscountAmount).toLocaleString('vi-VN')}đ<br /></>
                  )}
                  • Còn lại {Math.max(0, usageLimit - usedCount)} lượt sử dụng
                  <br />
                  • Áp dụng cho: {applicableFor === 'all' ? 'Tất cả khách hàng' : 
                    applicableFor === 'new_customer' ? 'Khách hàng mới' : 'Khách hàng thân thiết'}
                </Paragraph>
              </div>

              {/* Details */}
              <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      <Text strong>Thời gian áp dụng</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {coupon.validFrom ? moment(coupon.validFrom).format('DD/MM/YYYY') : 'N/A'} - {coupon.validUntil ? moment(coupon.validUntil).format('DD/MM/YYYY') : 'N/A'}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      <Text strong>Hết hạn sau</Text>
                    </div>
                    <Text type={isExpiringSoon ? "danger" : isExpired ? "danger" : "secondary"} style={{ fontSize: 13 }}>
                      {isExpired ? 'Đã hết hạn' : daysRemaining > 0 ? `${daysRemaining} ngày` : daysRemaining === 0 ? 'Hôm nay' : 'N/A'}
                    </Text>
                  </Col>
                </Row>
              </div>

              {/* Action */}
              <div style={{ 
                padding: '12px 16px', 
                background: '#f5f5f5', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Text strong>Mã: </Text>
                  <Text code style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {couponCode}
                  </Text>
                </div>
                <Button 
                  type="primary" 
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyCode(couponCode)}
                  disabled={isExpired || !isActive || usedCount >= usageLimit}
                >
                  Sao chép
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  if (loading) {
    return (
      <Content style={{ padding: '50px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải ưu đãi...</Text>
          </div>
        </div>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '20px 50px', background: '#fff', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
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
        <Breadcrumb.Item>Ưu đãi</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1} style={{ color: '#1a1a1a', marginBottom: 16 }}>
          🎉 Ưu đãi đặc biệt
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666' }}>
          Khám phá những mã giảm giá hấp dẫn chỉ dành cho bạn
        </Paragraph>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginBottom: 20, padding: 10, background: '#f0f0f0', borderRadius: 4 }}>
          <Text type="secondary">Debug: Found {coupons.length} coupons</Text>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length > 0 ? (
        <div>
          {coupons.map((coupon, index) => {
            try {
              return renderCouponCard(coupon);
            } catch (error) {
              console.error('Error rendering coupon:', error, coupon);
              return (
                <div key={index} style={{ padding: 20, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 8, marginBottom: 16 }}>
                  <Text type="danger">Lỗi hiển thị coupon #{index + 1}</Text>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Hiện tại chưa có ưu đãi nào"
        />
      )}

      {/* Footer Info */}
      <div style={{ 
        marginTop: 50, 
        padding: 24, 
        background: '#f9f9f9', 
        borderRadius: 8,
        textAlign: 'center'
      }}>
        <Title level={4}>Điều khoản sử dụng</Title>
        <Paragraph type="secondary">
          • Mỗi mã chỉ được sử dụng một lần cho mỗi khách hàng<br/>
          • Không áp dụng đồng thời với các chương trình khuyến mãi khác<br/>
          • Nhà hàng có quyền thay đổi điều khoản mà không cần báo trước<br/>
          • Liên hệ 0904 628 569 để được hỗ trợ
        </Paragraph>
      </div>
    </Content>
  );
};

export default Promotions; 