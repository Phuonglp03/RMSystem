import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotFound = () => {
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
      navigate('/');
    }
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc bạn không có quyền truy cập."
      extra={
        <Button type="primary" onClick={handleGoHome}>
          Về trang chủ
        </Button>
      }
    />
  );
};

export default NotFound; 