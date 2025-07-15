import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { checkAuthStatus } from '../redux/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isAuthenticated]);

  // Hiển thị loading trong lần đầu kiểm tra auth
  if (loading && !isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
          Đang kiểm tra trạng thái đăng nhập...
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer; 