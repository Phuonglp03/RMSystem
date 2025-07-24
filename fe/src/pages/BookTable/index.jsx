import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Row,
  Col,
  Button,
  Card,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Divider,
  Tag,
  Modal,
  Steps,
  Result,
  Spin,
  Alert
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './styles.css';
import reservationService from '../../services/reservation.service';
import tableService from '../../services/table.service';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const BookingTable = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [guests, setGuests] = useState(2);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [disabledTimeSlots, setDisabledTimeSlots] = useState([]);
  const [allTables, setAllTables] = useState([]);

  // Cập nhật thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Load tất cả bàn khi component mount
  useEffect(() => {
    fetchAllTables();
  }, []);

  // Tính toán các khung giờ có thể đặt bàn dựa trên thời gian hiện tại
  useEffect(() => {
    if (selectedDate) {
      calculateAvailableTimeSlots();
    }
  }, [selectedDate, currentTime]);

  // Khi chọn ngày và giờ, lấy dữ liệu bàn từ server
  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchAvailableTables();
    }
  }, [selectedDate, selectedTime]);

  // Tính toán các khung giờ có thể đặt bàn
  const calculateAvailableTimeSlots = () => {
    const slots = [];
    const disabledSlots = [];
    const isToday = selectedDate && selectedDate.isSame(moment(), 'day');
    
    // Giờ mở cửa và đóng cửa
    const openingHour = 10;
    const closingHour = 23;
    
    for (let hour = openingHour; hour < closingHour; hour++) {
      for (let minute of [0, 30]) {
        const timeSlot = moment().hour(hour).minute(minute);
        
        if (isToday) {
          // Tính thời gian chênh lệch tính bằng phút
          const currentTimeInMinutes = currentTime.hour() * 60 + currentTime.minute();
          const slotTimeInMinutes = hour * 60 + minute;
          const timeDifference = slotTimeInMinutes - currentTimeInMinutes;
          
          if (timeDifference > 30) {
            // Nếu thời gian đặt lớn hơn 30 phút so với hiện tại
            slots.push(timeSlot);
          } else {
            // Nếu thời gian đặt nhỏ hơn hoặc bằng 30 phút so với hiện tại
            // hoặc là thời gian trong quá khứ, thêm vào danh sách disable
            disabledSlots.push(timeSlot.format('HH:mm'));
          }
        } else {
          // Ngày khác thì hiển thị tất cả các khung giờ
          slots.push(timeSlot);
        }
      }
    }
    
    setAvailableTimeSlots(slots);
    setDisabledTimeSlots(disabledSlots);
  };

  const fetchAllTables = async () => {
    try {
      const response = await tableService.getAllTables();
      if (response.success) {
        setAllTables(response.tables);
      } else {
        messageApi.error(response.message || 'Không thể lấy danh sách tất cả bàn');
      }
    } catch (error) {
      console.error('Error fetching all tables:', error);
      messageApi.error('Đã xảy ra lỗi khi lấy danh sách tất cả bàn');
    }
  };

  const fetchAvailableTables = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAvailableTables(selectedDate, selectedTime);
      if (response.success) {
        setAvailableTables(response.data);
        setSelectedTables([]);
      } else {
        messageApi.error(response.message || 'Không thể lấy danh sách bàn');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      messageApi.error('Đã xảy ra lỗi khi lấy danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset thời gian khi thay đổi ngày
    form.setFieldsValue({ date, time: null });
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    form.setFieldsValue({ time });
  };

  const handleGuestsChange = (value) => {
    setGuests(value);
    form.setFieldsValue({ guests: value });
  };

  const handleTableClick = (tableId) => {
    const table = availableTables.find(t => t.id === tableId);

    if (table.status === 1) {
      messageApi.warning('Bàn này đã có người đặt!');
      return;
    }
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter(id => id !== tableId));
      return;
    }

    const currentCapacity = selectedTables.reduce((total, id) => {
      const selectedTable = availableTables.find(t => t.id === id);
      return total + selectedTable.capacity;
    }, 0);

    const newTable = availableTables.find(t => t.id === tableId);

    if (currentCapacity + newTable.capacity > guests + 2) {
      messageApi.warning(`Số chỗ của bàn đã chọn (${currentCapacity + newTable.capacity}) vượt quá số khách (${guests}) quá nhiều!`);
      return;
    }

    setSelectedTables([...selectedTables, tableId]);
  };

  const getTableStatus = (table) => {
    if (table.status === 1) return 'occupied'; // Đã đặt
    if (selectedTables.includes(table.id)) return 'selected'; // Đã chọn
    return 'available'; // Còn trống
  };

  const getMapTableStatus = (tableNumber) => {
    const table = availableTables.find(t => t.tableNumber === tableNumber.toString());
    if (!table) {
      // Nếu không có trong availableTables, kiểm tra xem có trong allTables không
      const allTable = allTables.find(t => t.tableNumber === tableNumber);
      if (!allTable) return 'not-exist'; // Bàn không tồn tại
      return 'occupied'; // Bàn tồn tại nhưng không available (đã đặt hoặc không trong khung giờ) - hiển thị như bàn đã đặt
    }
    return getTableStatus(table);
  };

  const getTableStatusText = (tableNumber) => {
    const table = availableTables.find(t => t.tableNumber === tableNumber.toString());
    if (!table) {
      const allTable = allTables.find(t => t.tableNumber === tableNumber);
      if (!allTable) return 'Không tồn tại';
      return 'Đã đặt/Không khả dụng';
    }
    
    if (table.status === 1) return 'Đã đặt';
    if (selectedTables.includes(table.id)) return 'Đã chọn';
    return 'Sẵn sàng';
  };

  const handleMapTableClick = (tableNumber) => {
    const table = availableTables.find(t => t.tableNumber === tableNumber.toString());
    
    if (table) {
      // Bàn có sẵn trong availableTables
      if (table.status === 1) {
        messageApi.warning(`Bàn ${tableNumber} đã có người đặt trong khung giờ này!`);
        return;
      }
      handleTableClick(table.id);
    } else {
      // Bàn không có trong availableTables
      const allTable = allTables.find(t => t.tableNumber === tableNumber);
      if (allTable) {
        if (selectedDate && selectedTime) {
          messageApi.warning(`Bàn ${tableNumber} đã được đặt hoặc không khả dụng trong khung giờ ${selectedTime.format('HH:mm')} ngày ${selectedDate.format('DD/MM/YYYY')}`);
        } else {
          messageApi.info('Vui lòng chọn ngày và giờ để xem trạng thái bàn');
        }
      } else {
        messageApi.error(`Bàn ${tableNumber} không tồn tại trong hệ thống`);
      }
    }
  };

  const getTotalCapacity = () => {
    return selectedTables.reduce((total, id) => {
      const table = availableTables.find(t => t.id === id);
      return total + table.capacity;
    }, 0);
  };

  const getSelectedTablesInfo = () => {
    return selectedTables.map(id => {
      const table = availableTables.find(t => t.id === id);
      return `Bàn ${table.tableNumber} (${table.capacity} người)`;
    }).join(', ');
  };

  // Component cho phép chọn thời gian từ danh sách có sẵn thay vì TimePicker
  const TimeSelector = ({ value, onChange }) => {
    return (
      <Select
        style={{ width: '100%' }}
        placeholder="Chọn giờ"
        value={value ? value.format('HH:mm') : undefined}
        onChange={(timeString) => {
          const [hours, minutes] = timeString.split(':').map(Number);
          const newTime = moment().hour(hours).minute(minutes);
          onChange(newTime);
        }}
      >
        {availableTimeSlots.map((time) => (
          <Option 
            key={time.format('HH:mm')} 
            value={time.format('HH:mm')}
            disabled={disabledTimeSlots.includes(time.format('HH:mm'))}
          >
            {time.format('HH:mm')}
          </Option>
        ))}
      </Select>
    );
  };

  const isSelectedTimeValid = () => {
    if (!selectedTime) return false;
    
    const isToday = selectedDate && selectedDate.isSame(moment(), 'day');
    if (!isToday) return true;
    
    const selectedTimeInMinutes = selectedTime.hour() * 60 + selectedTime.minute();
    const currentTimeInMinutes = currentTime.hour() * 60 + currentTime.minute();
    
    return selectedTimeInMinutes > currentTimeInMinutes + 30;
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!selectedDate || !selectedTime) {
        messageApi.error('Vui lòng chọn ngày và giờ!');
        return;
      }
      
      if (selectedDate.isSame(moment(), 'day') && !isSelectedTimeValid()) {
        messageApi.error('Vui lòng chọn thời gian lớn hơn 30 phút so với hiện tại!');
        return;
      }
    } else if (currentStep === 1) {
      if (selectedTables.length === 0) {
        messageApi.error('Vui lòng chọn ít nhất một bàn!');
        return;
      }

      const totalCapacity = getTotalCapacity();
      if (totalCapacity + 2 < guests) {
        messageApi.error(`Số chỗ ngồi (${totalCapacity}) không đủ cho ${guests} khách!`);
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = (values) => {
    const formData = {
      ...values,
      date: selectedDate.format('YYYY-MM-DD'),
      time: selectedTime.format('HH:mm'),
      tables: selectedTables,
      guests: guests,
      totalCapacity: getTotalCapacity(),
      note: values.note || ''
    };

    setBookingData(formData);
    setConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setSubmitLoading(true);
      const serviceData = {
        ...bookingData,
        date: bookingData.date,
        time: bookingData.time,
        note: bookingData.note,
        email: bookingData.email
      };
      const response = await reservationService.createReservation(bookingData);

      if (response.success) {
        // Không hiển thị mã code, chỉ chuyển sang trang cảm ơn
        setBookingComplete(true);
        messageApi.success('Đặt bàn thành công! Vui lòng đợi nhân viên xác nhận.');
      } else {
        messageApi.error(response.message || 'Đặt bàn thất bại!');
      }
    } catch (error) {
      console.error('Error booking table:', error);
      messageApi.error('Đã xảy ra lỗi khi đặt bàn');
    } finally {
      setSubmitLoading(false);
      setConfirmModal(false);
      setCurrentStep(currentStep + 1);
    }
  };

  const resetBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedTables([]);
    setAvailableTables([]);
    setGuests(2);
    setCurrentStep(0);
    setBookingData({});
    setBookingComplete(false);
    setBookingId('');
    form.resetFields();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>Chọn thời gian</Title>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="date"
                    label="Ngày đặt bàn"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      onChange={handleDateChange}
                      disabledDate={(current) => current && current < moment().startOf('day')}
                      placeholder="Chọn ngày"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="time"
                    label="Giờ đặt bàn"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ!' }]}
                  >
                    <TimeSelector onChange={handleTimeChange} value={selectedTime} />
                  </Form.Item>
                  <div style={{ marginTop: -12, fontSize: '12px', color: '#888' }}>
                    *Chỉ hiển thị khung giờ cách thời điểm hiện tại ít nhất 30 phút
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="guests"
                    label="Số lượng khách"
                    initialValue={2}
                    rules={[{ required: true, message: 'Vui lòng chọn số lượng khách!' }]}
                  >
                    <Select onChange={handleGuestsChange}>
                      {[...Array(20)].map((_, i) => (
                        <Option key={i + 1} value={i + 1}>{i + 1} người</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              {selectedDate && availableTimeSlots.length === 0 && (
                <Row>
                  <Col span={24}>
                    <Alert
                      message="Không có khung giờ phù hợp"
                      description="Vui lòng chọn ngày khác hoặc trở lại sau. Nhà hàng chỉ cho phép đặt bàn sau 30 phút so với thời gian hiện tại."
                      type="warning"
                      showIcon
                    />
                  </Col>
                </Row>
              )}
            </Form>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <Title level={4}>Chọn bàn</Title>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="table-legend">
                  <div>
                    <Tag color="#2ecc71">Sẵn sàng</Tag>
                    <Tag color="#ff4d4f">Đã chọn</Tag>
                    <Tag color="#95a5a6">Đã đặt</Tag>
                  </div>
                  <div>
                    <Text>Số khách: <b>{guests}</b></Text>
                    <Divider type="vertical" />
                    <Text>Số chỗ đã chọn: <b>{getTotalCapacity()}</b></Text>
                  </div>
                </div>
              </Col>
              {loading ? (
                <Col span={24} style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  <div style={{ marginTop: 16 }}>Đang tải danh sách bàn...</div>
                </Col>
              ) : (
                <>
                  {availableTables.length === 0 ? (
                    <Col span={24}>
                      <Card>
                        <Result
                          status="warning"
                          title="Không có bàn trống"
                          subTitle="Vui lòng chọn ngày hoặc giờ khác"
                        />
                      </Card>
                    </Col>
                  ) : (
                    <>
                      <Col xs={24} lg={14}>
                        {availableTables.length === 0 ? (
                          <Card>
                            <Result
                              status="warning"
                              title="Không có bàn nào"
                              subTitle="Vui lòng chọn ngày hoặc giờ khác"
                            />
                          </Card>
                        ) : (
                          <div className="restaurant-layout">
                            {availableTables.map(table => (
                              <div
                                key={table.id}
                                className={`table-item ${getTableStatus(table)}`}
                                onClick={() => handleTableClick(table.id)}
                              >
                                <div className="table-number">BÀN {table.tableNumber}</div>
                                <div className="table-info">
                                  <span className="table-capacity">{table.capacity} người</span>
                                  <span className="status">
                                    {table.status === 1 
                                      ? 'Đã đặt' 
                                      : selectedTables.includes(table.id) 
                                        ? 'Đã chọn' 
                                        : 'Sẵn sàng'
                                    }
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Col>
                      <Col xs={24} lg={10}>
                        <Card title="Sơ đồ nhà hàng" className="restaurant-map-card">
                          <div className="restaurant-map">
                            <div className="map-entrance">
                              <div className="entrance-door">LỐI VÀO</div>
                            </div>
                            
                            <div className="dining-area">
                              <div className="cashier">THU NGÂN</div>
                              
                              {allTables.length > 0 ? (
                                <div className="dynamic-tables">
                                  {(() => {
                                    const sortedTables = [...allTables].sort((a, b) => a.tableNumber - b.tableNumber);
                                    const rows = [];
                                    for (let i = 0; i < sortedTables.length; i += 4) {
                                      const rowTables = sortedTables.slice(i, i + 4);
                                      rows.push(
                                        <div key={`row-${i}`} className="table-row">
                                          {rowTables.map(table => (
                                            <div 
                                              key={table._id}
                                              className={`map-table ${getMapTableStatus(table.tableNumber)}`} 
                                              data-table={table.tableNumber}
                                              data-capacity={table.capacity}
                                              onClick={() => handleMapTableClick(table.tableNumber)}
                                              title={`Bàn ${table.tableNumber} - ${table.capacity} người - ${getTableStatusText(table.tableNumber)}`}
                                            >
                                              <span className="table-number-display">{table.tableNumber}</span>
                                              <span className="table-capacity-display">{table.capacity}p</span>
                                            </div>
                                          ))}
                                          {rowTables.length < 4 && [...Array(4 - rowTables.length)].map((_, idx) => (
                                            <div key={`empty-${i}-${idx}`} className="map-table empty"></div>
                                          ))}
                                        </div>
                                      );
                                      
                                      // Add aisle after every 2 rows (except the last one)
                                      if ((i + 4) < sortedTables.length && Math.floor(i / 8) % 2 === 1) {
                                        rows.push(
                                          <div key={`aisle-${i}`} className="table-row center-aisle">
                                            <div className="aisle-space"></div>
                                          </div>
                                        );
                                      }
                                    }
                                    
                                    return rows;
                                  })()}
                                </div>
                              ) : (
                                <div className="loading-tables">
                                  <Spin size="small" />
                                  <span style={{ marginLeft: 8 }}>Đang tải sơ đồ bàn...</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Kitchen and facilities */}
                            <div className="facilities">
                              <div className="kitchen">BẾP</div>
                              <div className="restroom">WC</div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </>
                  )}
                </>
              )}
              {selectedTables.length > 0 && (
                <Col span={24}>
                  <Card>
                    <Title level={5}>Bàn đã chọn:</Title>
                    <Paragraph>{getSelectedTablesInfo()}</Paragraph>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <Title level={4}>Thông tin khách hàng</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mail!' },
                      { pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: 'Mail không hợp lệ!' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="note"
                    label="Ghi chú đặc biệt (nếu có)"
                  >
                    <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Card className="booking-summary">
                    <Title level={5}>Thông tin đặt bàn:</Title>
                    <Paragraph>
                      <CalendarOutlined /> Ngày: {selectedDate?.format('DD/MM/YYYY')}
                      <Divider type="vertical" />
                      <ClockCircleOutlined /> Giờ: {selectedTime?.format('HH:mm')}
                    </Paragraph>
                    <Paragraph>
                      <TeamOutlined /> Số khách: {guests} người
                      <Divider type="vertical" />
                      <EnvironmentOutlined /> Bàn: {getSelectedTablesInfo()}
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <Result
              status="success"
              title="Cảm ơn bạn đã đặt bàn!"
              subTitle={
                <div style={{ fontSize: '16px', color: 'black' }}>
                  Chúng tôi đã nhận được yêu cầu đặt bàn của bạn.<br/>
                  Vui lòng đợi nhân viên xác nhận qua email hoặc điện thoại.
                </div>
              }
              extra={
                [
                <Button type="primary" key="console" onClick={resetBooking}>
                  Đặt bàn mới
                </Button>
              ]}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="table-booking-layout">
      {contextHolder}
      <Content className="content">
        <div className="container">
          <Card>
            <Steps current={currentStep}>
              <Step title="Thời gian" icon={<CalendarOutlined />} />
              <Step title="Chọn bàn" icon={<EnvironmentOutlined />} />
              <Step title="Thông tin" icon={<UserOutlined />} />
              <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
            </Steps>
            <Divider />
            <div className="steps-content">
              {renderStepContent()}
            </div>
            <Divider />
            <div className="steps-action">
              {currentStep > 0 && currentStep < 3 && (
                <Button style={{ margin: '0 8px' }} onClick={prevStep}>
                  Quay lại
                </Button>
              )}
              {currentStep < 2 && (
                <Button 
                  type="primary" 
                  onClick={nextStep}
                  disabled={currentStep === 0 && (
                    !selectedDate || 
                    !selectedTime || 
                    availableTimeSlots.length === 0 ||
                    (selectedDate.isSame(moment(), 'day') && !isSelectedTimeValid())
                  )}
                >
                  Tiếp tục
                </Button>
              )}
              {currentStep === 2 && (
                <Button type="primary" onClick={() => form.submit()}>
                  Đặt bàn
                </Button>
              )}
            </div>
          </Card>
        </div>
      </Content>

      <Modal
        title="Xác nhận đặt bàn"
        visible={confirmModal}
        onOk={handleConfirmBooking}
        onCancel={() => setConfirmModal(false)}
        confirmLoading={submitLoading}
      >
        <p>Bạn có chắc chắn muốn đặt bàn với thông tin sau:</p>
        {bookingData.name && (
          <>
            <p><strong>Họ tên:</strong> {bookingData.name}</p>
            <p><strong>Số điện thoại:</strong> {bookingData.phone}</p>
            <p><strong>Email:</strong> {bookingData.email}</p>
            <p><strong>Ngày đặt:</strong> {bookingData.date}</p>
            <p><strong>Giờ đặt:</strong> {bookingData.time}</p>
            <p><strong>Số khách:</strong> {bookingData.guests} người</p>
            <p><strong>Bàn đã chọn:</strong> {getSelectedTablesInfo()}</p>
            {bookingData.note && <p><strong>Ghi chú:</strong> {bookingData.note}</p>}
          </>
        )}
      </Modal>
    </Layout>
  );
};

export default BookingTable;