import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, message } from 'antd'; 
import { Link, useNavigate } from 'react-router-dom';

import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons'; // Thêm icons cho đẹp hơn (tùy chọn)

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    phoneNum: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.userName) return "Tên đăng nhập là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Định dạng email không hợp lệ";
    if (!/^[0-9]{10}$/.test(formData.phoneNum)) return "Số điện thoại phải có 10 chữ số";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) return "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số";
    if (formData.password !== formData.confirmPassword) return "Mật khẩu không khớp";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    // e.preventDefault(); // Với Form của antd, onFinish đã xử lý việc này
    const error = validateForm();
    if (error) {
      message.error(error);
      return;
    }
    console.log("Form data submitted:", formData);
    message.success("Tạo tài khoản thành công!"); 
    setTimeout(() => navigate("/login"), 500);
  };

 
  const onFinish = () => {
    handleSubmit(); 
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin đã nhập!');
  };


  return (
    <div className="vh-100 w-100 d-flex">
      <Row className="m-0 w-100">
        <Col md={12} lg={12} className="d-none d-md-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: 'orange', padding: '20px' }}>
          <img
            src="https://posapp.vn/wp-content/uploads/2020/09/%C4%91%E1%BB%93ng-b%E1%BB%99-n%E1%BB%99i-th%E1%BA%A5t.jpg"
            alt="Nội thất đẹp"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
          />
          <p style={{ marginTop: '10px', fontSize: '70px', fontWeight: '500', textAlign: 'center', fontStyle: 'italic' }}>
            Trải nghiệm không gian sống hoàn hảo cùng chúng tôi!
          </p>
        </Col>

        <Col md={12} lg={12} className="d-flex align-items-center justify-content-center" style={{ padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="mb-4 text-center" style={{fontSize: '28px', fontWeight: 'bold'}}>Tạo tài khoản mới!</h3>

            <Form
              name="signup"
              onFinish={onFinish} 
              onFinishFailed={onFinishFailed}
              layout="vertical" 
              initialValues={formData} 
            >
              <Form.Item
                label="Tên đăng nhập"
                name="userName" 
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Tên đăng nhập"
                  name="userName" 
                  value={formData.userName}
                  onChange={handleChange}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phoneNum"
              >
                <Input
                  prefix={<PhoneOutlined className="site-form-item-icon" />}
                  placeholder="Số điện thoại"
                  name="phoneNum"
                  value={formData.phoneNum}
                  onChange={handleChange}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
              >
                <Input.Password 
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Mật khẩu"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={['password']} // Giúp antd biết field này phụ thuộc vào field password
                // hasFeedback // Hiển thị icon feedback
                // rules={[ // Ví dụ thêm rule của antd
                //   ({ getFieldValue }) => ({
                //     validator(_, value) {
                //       if (!value || getFieldValue('password') === value) {
                //         return Promise.resolve();
                //       }
                //       return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                //     },
                //   }),
                // ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Xác nhận mật khẩu"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                
                <Button
                type="submit"
                variant="outline-primary"
                className="w-100 mb-3 py-3 fw-bold"
                size="large"
                style={{
                  borderColor: '#1890ff',
                  color: '#1890ff',
                  fontSize: '16px'
                }}
              >
                 ĐĂNG KÝ
              </Button>
              </Form.Item>

              <div className="text-center">
                Đã có tài khoản?{' '}
                <Link to="/login" style={{ color: '#1677ff', textDecoration: 'none', fontWeight: 'bold' }}>
                  Đăng nhập
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Signup;