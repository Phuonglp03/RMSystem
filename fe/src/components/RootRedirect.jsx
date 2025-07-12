import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const RootRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        switch (user.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'servant':
            navigate('/', { replace: true });
            break;
          case 'chef':
            navigate('/', { replace: true });
            break;
          default:
            break;
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Hiển thị loading khi đang check auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu không có user hoặc là customer, hiển thị HomePage
  return null; // HomePage sẽ được render thông qua MainLayout
};

export default RootRedirect; 