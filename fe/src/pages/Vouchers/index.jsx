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
  message,
  Modal,
  App
} from 'antd';
import { 
  GiftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
  PercentageOutlined,
  DollarOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import couponService from '../../services/coupon.service';
import userService from '../../services/user.service';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Vouchers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [userCoupons, setUserCoupons] = useState([]);
  const [loadingUserCoupons, setLoadingUserCoupons] = useState(false);
  
  // Get authentication state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCoupons();
    if (isAuthenticated && user?._id) {
      fetchUserPoints();
      fetchUserCoupons();
    }
  }, [isAuthenticated, user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAllCoupons();
      console.log('Coupons response:', response);
      
      // Backend trả về trực tiếp array hoặc có data property
      const couponsData = response.data || response || [];
      console.log('Processed coupons data:', couponsData);
      
      // Filter coupons to only show active, non-expired, and with remaining quantity
      const validCoupons = couponsData.filter(coupon => {
        const isValid = 
          coupon.is_active !== false && 
          new Date(coupon.valid_to) >= new Date() &&
          coupon.quantity > 0 &&
          coupon.applicable_for === 'all';
        return isValid;
      });
      
      setCoupons(validCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      messageApi.error('Không thể tải danh sách ưu đãi');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      if (!user?._id) return;
      
      const response = await userService.getUserLoyalty(user._id);
      if (response && response.success && response.data) {
        setUserPoints(response.data.points);
      } else {
        console.error('Error fetching user loyalty data:', response);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchUserCoupons = async () => {
    try {
      if (!user?._id) return;
      
      setLoadingUserCoupons(true);
      const response = await userService.getUserCoupons(user._id);
      if (response && response.success) {
        setUserCoupons(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching user coupons:', error);
    } finally {
      setLoadingUserCoupons(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) {
      messageApi.error('Mã coupon không hợp lệ');
      return;
    }
    navigator.clipboard.writeText(code);
    messageApi.success(`Đã sao chép mã: ${code}`);
  };
  
  const [modal, contextHolderModal] = Modal.useModal();

  const handleRedeemClick = (coupon) => {
    if (!isAuthenticated) {
      const modal = Modal.confirm({
        title: 'Bạn cần đăng nhập',
        content: 
          <App>
            <div>Để đổi điểm lấy mã giảm giá, bạn cần đăng nhập vào tài khoản của mình.</div>
          </App>,
        okText: 'Đăng nhập ngay',
        cancelText: 'Để sau',
        onOk: () => navigate('/login', { state: { from: '/vouchers' } })
      });
      return;
    }
    
    // Check if user already has this coupon
    const alreadyOwned = userCoupons.some(userCoupon => 
      userCoupon.coupon_code === coupon.coupon_code
    );
    
    if (alreadyOwned) {
      messageApi.info('Bạn đã sở hữu mã giảm giá này');
      return;
    }
    
    // If authenticated, show redeem confirmation
    setSelectedCoupon(coupon);
    setRedeemModalVisible(true);
  };

  const handleRedeemConfirm = async () => {
    try {
      if (!selectedCoupon || !user?._id) return;
      
      // Check if user has enough points
      if (userPoints < selectedCoupon.point_required) {
        messageApi.error('Bạn không đủ điểm để đổi mã giảm giá này');
        setRedeemModalVisible(false);
        return;
      }
      
      // Call API to redeem the coupon
      const response = await couponService.redeemCoupon(user._id, selectedCoupon._id);
      
      if (response && response.success) {
        messageApi.success(`Đã đổi thành công mã giảm giá: ${selectedCoupon.coupon_name}`);
        
        // Update user points with value from response
        if (response.data && response.data.remainingPoints !== undefined) {
          setUserPoints(response.data.remainingPoints);
        } else {
          // Fallback if response doesn't include points
          setUserPoints(prevPoints => prevPoints - selectedCoupon.point_required);
        }
        
        // Refresh user coupons
        fetchUserCoupons();
        
        // Refresh coupons list
        fetchCoupons();
      } else {
        messageApi.error(response?.message || 'Không thể đổi mã giảm giá');
      }
      
      setRedeemModalVisible(false);
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      
      // Handle specific error messages from API
      if (error.response && error.response.data && error.response.data.message) {
        messageApi.error(error.response.data.message);
      } else {
        messageApi.error('Không thể đổi mã giảm giá. Vui lòng thử lại sau.');
      }
      
      setRedeemModalVisible(false);
    }
  };

  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return -1;
    const today = moment();
    const endDate = moment(validUntil);
    return endDate.diff(today, 'days');
  };

  const getDiscountText = (coupon) => {
    // Kiểm tra và xử lý safe cho discountValue
    const discountValue = coupon?.discount_value;
    const discountType = coupon?.discount_type;
    
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

  // Check if user owns a specific coupon
  const isUserOwnCoupon = (couponCode) => {
    return userCoupons.some(coupon => coupon.coupon_code === couponCode);
  };

  const renderCouponCard = (coupon) => {
    // Kiểm tra coupon object có đầy đủ thông tin không
    if (!coupon) return null;
    
    const daysRemaining = getDaysRemaining(coupon.valid_to);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;
    
    // Safe access cho các properties
    const couponName = coupon.coupon_name || 'Tên coupon không có';
    const couponCode = coupon.coupon_code || 'CODE';
    const description = coupon.description || 'Mã giảm giá đặc biệt';
    const discountType = coupon.discount_type || 'amount';
    const quantity = coupon.quantity || 0;
    const pointRequired = coupon.point_required || 0;
    const isActive = coupon.is_active !== false; // Default true nếu undefined
    
    // Check if user owns this coupon
    const isOwned = isUserOwnCoupon(couponCode);
    
    return (
      <Card
        key={coupon._id || Math.random()}
        hoverable
        style={{ 
          marginBottom: 24,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Row gutter={24}>
          {/* Left side - Coupon Visual */}
          <Col xs={24} md={8}>
            <div
              style={{
                width: '100%',
                height: '100%',
                minHeight: 250,
                background: `linear-gradient(135deg, ${getDiscountTypeColor(discountType)} 0%, #ffd700 100%)`,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px 0'
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

              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                Coupon
              </Text>
              <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
                {getDiscountText(coupon)}
              </Text>
              {discountType === 'percent' ? (
                <PercentageOutlined style={{ fontSize: 20, marginLeft: 4 }} />
              ) : (
                <Text style={{ color: 'white', fontSize: 18 }}>OFF</Text>
              )}
              
              {pointRequired > 0 && (
                <div style={{ marginTop: 20 }}>
                  <Tag color="#108ee9" style={{ fontSize: 14, padding: '4px 8px' }}>
                    {pointRequired} điểm
                  </Tag>
                </div>
              )}
              
              <div style={{ marginTop: 20 }}>
                <Text style={{ color: 'white', fontSize: 14 }}>
                  {quantity} lượt sử dụng còn lại
                </Text>
              </div>
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
                    <Tag color="green">Có sẵn</Tag>
                  </div>
                </div>
                
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {description}
                </Text>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16, flex: 1 }}>
                <Paragraph style={{ fontSize: 15, margin: 0 }}>
                  • Giảm {getDiscountText(coupon)} cho đơn hàng từ {formatMinOrder(coupon.min_order_amount)}
                  <br />
                  {coupon.max_discount_amount && discountType === 'percent' && (
                    <>• Giảm tối đa {Number(coupon.max_discount_amount).toLocaleString('vi-VN')}đ<br /></>
                  )}
                  • Còn lại {quantity} lượt sử dụng
                  <br />
                  • Áp dụng cho: Tất cả khách hàng
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
                      {coupon.valid_from ? moment(coupon.valid_from).format('DD/MM/YYYY') : 'N/A'} - {coupon.valid_to ? moment(coupon.valid_to).format('DD/MM/YYYY') : 'N/A'}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      <Text strong>Hết hạn sau</Text>
                    </div>
                    <Text type={isExpiringSoon ? "danger" : "secondary"} style={{ fontSize: 13 }}>
                      {daysRemaining > 0 ? `${daysRemaining} ngày` : daysRemaining === 0 ? 'Hôm nay' : 'N/A'}
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
                {isAuthenticated && isOwned ? (
                  <>
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
                    >
                      Sao chép
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Text strong>Mã: </Text>
                      <Text style={{ fontSize: 16 }}>
                        <LockOutlined /> {isAuthenticated ? 'Chưa sở hữu' : 'Đăng nhập để xem'}
                      </Text>
                    </div>
                    {isAuthenticated ? (
                      <Button 
                        type="primary" 
                        icon={<GiftOutlined />}
                        onClick={() => handleRedeemClick(coupon)}
                        disabled={userPoints < pointRequired}
                      >
                        Đổi {pointRequired} điểm
                      </Button>
                    ) : (
                      <Button 
                        type="primary" 
                        icon={<GiftOutlined />}
                        onClick={() => handleRedeemClick(coupon)}
                      >
                        Đổi ngay
                      </Button>
                    )}
                  </>
                )}
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
      {contextHolder}
      {contextHolderModal}
      {/* Breadcrumb */}
      <Breadcrumb 
        style={{ marginBottom: 24 }}
        items={[
          {
            title: (
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                style={{ padding: 0 }}
              >
                Trang chủ
              </Button>
            )
          },
          {
            title: 'Ưu đãi'
          }
        ]}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1} style={{ color: '#1a1a1a', marginBottom: 16 }}>
          🎉 Ưu đãi đặc biệt
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666' }}>
          Khám phá những mã giảm giá hấp dẫn chỉ dành cho bạn
        </Paragraph>
        
        {isAuthenticated && (
          <Tag color="#108ee9" style={{ fontSize: 16, padding: '4px 8px' }}>
            Điểm tích lũy của bạn: <b>{userPoints}</b> điểm
          </Tag>
        )}
      </div>

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

      {/* Redeem Modal */}
      <App>
        <Modal
          title="Xác nhận đổi điểm"
          open={redeemModalVisible}
          onOk={handleRedeemConfirm}
          onCancel={() => setRedeemModalVisible(false)}
          okText="Xác nhận đổi"
          cancelText="Hủy"
        >
          {selectedCoupon && (
            <>
              <p>Bạn có chắc chắn muốn đổi <b>{selectedCoupon.point_required} điểm</b> để nhận mã giảm giá <b>{selectedCoupon.coupon_name}</b>?</p>
              <p>Điểm hiện tại: <b>{userPoints}</b> điểm</p>
              <p>Điểm sau khi đổi: <b>{Math.max(0, userPoints - selectedCoupon.point_required)}</b> điểm</p>
            </>
          )}
        </Modal>
      </App>
    </Content>
  );
};

export default Vouchers; 