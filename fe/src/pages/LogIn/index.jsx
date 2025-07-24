import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Row, Alert, Spinner } from 'react-bootstrap';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/authSlice';
import '../Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect theo role hoặc về trang đã lưu
      const from = location.state?.from?.pathname || getDefaultRoute(user.role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'servant':
        return '/servant';
      case 'chef':
        return '/chef';
      default:
        return '/';
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = 'Email/Username là bắt buộc';
    }

    if (!password) {
      errors.password = 'Password là bắt buộc';
    } else if (password.length < 6) {
      errors.password = 'Password phải có ít nhất 6 ký tự';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Navigation sẽ được xử lý bởi useEffect khi isAuthenticated thay đổi
    } catch (error) {
      // Error đã được xử lý trong Redux
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container vh-100 vw-100 d-flex align-items-center">
      <div className="container">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <div className="auth-card">
              <Row className="g-0">
                <Col md={6} className="auth-image-section d-flex flex-column justify-content-center align-items-center p-4">
                  <img
                    src="https://duckhoi.vn/wp-content/uploads/2023/12/sepia.jpg"
                    alt="Restaurant Interior"
                    className="auth-image"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <p className="welcome-text mt-4 text-center" style={{ fontSize: '48px' }}>
                    Trải nghiệm không gian ẩm thực hoàn hảo!
                  </p>
                </Col>

                <Col md={6} className="auth-form-section d-flex align-items-center">
                  <div className="w-100">
                    <h3 className="auth-title">Chào mừng trở lại!</h3>

                    {error && (
                      <Alert variant="danger" className="auth-alert" dismissible onClose={() => dispatch(clearError())}>
                        {error}
                      </Alert>
                    )}

                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="auth-form">
                      <Form.Group className="mb-3">
                        <Form.Label>Email/Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập email hoặc username của bạn"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          isInvalid={validated && !email}
                        />
                        <Form.Control.Feedback type="invalid">
                          Email/Username là bắt buộc
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Nhập mật khẩu"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          isInvalid={validated && (!password || password.length < 6)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {!password ? 'Password là bắt buộc' : 'Password phải có ít nhất 6 ký tự'}
                        </Form.Control.Feedback>
                      </Form.Group>

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
                            Đang đăng nhập...
                          </>
                        ) : (
                          'Đăng nhập'
                        )}
                      </Button>

                      <div className="text-center mb-3">
                        <NavLink to='/forgotPass' className="auth-link">
                          Quên mật khẩu?
                        </NavLink>
                      </div>

                      <div className="text-center">
                        Chưa có tài khoản?{' '}
                        <NavLink to='/signup' className="auth-link">
                          Đăng ký ngay
                        </NavLink>
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

export default Login;