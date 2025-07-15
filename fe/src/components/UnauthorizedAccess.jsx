import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UnauthorizedAccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'servant':
          navigate('/');
          break;
        case 'chef':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={handleGoHome}>
          {isAuthenticated ? 'Về trang chủ' : 'Đăng nhập'}
        </Button>
      }
    />
  );
};

export default UnauthorizedAccess; 