import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Row, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../redux/authSlice';
import '../Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: ''
  });
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear error khi component mount
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect nếu đã đăng nhập
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.username || formData.username.trim().length < 3) {
      errors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (!formData.password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const userData = {
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        role: 'customer'
      };

      await dispatch(registerUser(userData)).unwrap();
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="auth-container vh-100 d-flex align-items-center">
      <div className="container">
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <div className="auth-card">
              <Row className="g-0">
                <Col md={5} className="auth-image-section d-flex flex-column justify-content-center align-items-center p-4">
                  <img
                    src="https://posapp.vn/wp-content/uploads/2020/09/%C4%91%E1%BB%93ng-b%E1%BB%99-n%E1%BB%99i-th%E1%BA%A5t.jpg"
                    alt="Restaurant Interior"
                    className="auth-image"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <p className="welcome-text mt-4 text-center" style={{ fontSize: '36px' }}>
                    Trải nghiệm không gian ẩm thực hoàn hảo!
                  </p>
                </Col>

                <Col md={7} className="auth-form-section">
                  <div className="w-100">
                    <h3 className="auth-title">Tạo tài khoản mới</h3>

                    {error && (
                      <Alert variant="danger" className="auth-alert" dismissible onClose={() => dispatch(clearError())}>
                        {error}
                      </Alert>
                    )}

                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="auth-form">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Họ và tên</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Nhập họ và tên"
                              name="fullname"
                              value={formData.fullname}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Tên đăng nhập *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Nhập tên đăng nhập"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              minLength={3}
                              isInvalid={validated && (!formData.username || formData.username.trim().length < 3)}
                            />
                            <Form.Control.Feedback type="invalid">
                              Username phải có ít nhất 3 ký tự
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="Nhập email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              isInvalid={validated && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                            />
                            <Form.Control.Feedback type="invalid">
                              Email không hợp lệ
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Số điện thoại *</Form.Label>
                            <Form.Control
                              type="tel"
                              placeholder="Nhập số điện thoại"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              pattern="[0-9]{10}"
                              isInvalid={validated && (!formData.phone || !/^[0-9]{10}$/.test(formData.phone))}
                            />
                            <Form.Control.Feedback type="invalid">
                              Số điện thoại phải có 10 chữ số
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                            >
                              <option value="">Chọn giới tính</option>
                              <option value="male">Nam</option>
                              <option value="female">Nữ</option>
                              <option value="other">Khác</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu *</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Nhập mật khẩu"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              minLength={6}
                              isInvalid={validated && (!formData.password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password))}
                            />
                            <Form.Control.Feedback type="invalid">
                              Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu *</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Nhập lại mật khẩu"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              isInvalid={validated && (formData.password !== formData.confirmPassword)}
                            />
                            <Form.Control.Feedback type="invalid">
                              Mật khẩu không khớp
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button
                        type="submit"
                        variant="primary"
                        className="auth-btn w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2 auth-spinner"
                            />
                            Đang đăng ký...
                          </>
                        ) : (
                          'Đăng ký'
                        )}
                      </Button>

                      <div className="text-center">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="auth-link">
                          Đăng nhập ngay
                        </Link>
                      </div>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Signup;