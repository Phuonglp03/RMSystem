import React, { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted (no API call)");
    console.log("Username:", userName);
    console.log("Password:", password);
  };


  return (
    <div className="vh-100 vw-100 d-flex">
      <Row className="m-0 w-100">
        <Col md={6} className="d-none d-md-block d-flex flex-column justify-content-end align-items-center" style={{ backgroundColor: 'orange', padding: '20px' }}>
          <img
            src="https://duckhoi.vn/wp-content/uploads/2023/12/sepia.jpg"
            alt="Nội thất đẹp"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
          />
          <p style={{ marginTop: '10px', fontSize: '70px', fontWeight: '500', textAlign: 'center', fontStyle: 'italic' }}>
            Trải nghiệm không gian sống hoàn hảo cùng chúng tôi!
          </p>
        </Col>
        <Col md={6} className="d-flex align-items-center justify-content-center">
          <div style={{ width: '60%' }}>
            <h3 className="mb-4">Welcome back!</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  className="py-2"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  className="py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="outline-danger"
                className="w-100 mb-3 py-3 fw-bold"
                style={{
                  borderColor: '#ff4b4b',
                  color: '#ff4b4b',
                  fontSize: '16px'
                }}
              >
                SIGN IN
              </Button>
              <div className="text-center mb-3">
                Forgot Password by Email! <NavLink to='/forgotPass' style={{ color: '#ff4b4b', textDecoration: 'none', fontWeight: 'bold' }}>Forgot Password</NavLink>
              </div>
              <div className="text-center mb-3">
                Don't have an account? <NavLink to='/signup' style={{ color: '#ff4b4b', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</NavLink>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;