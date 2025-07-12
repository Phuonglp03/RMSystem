import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra trạng thái auth
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


  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {

    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'servant':
        return <Navigate to="/" replace />;
      case 'chef':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Component riêng cho admin routes
export const AdminProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// Component riêng cho servant routes
export const ServantProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['servant']}>
      {children}
    </ProtectedRoute>
  );
};

// Component riêng cho chef routes
export const ChefProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['chef']}>
      {children}
    </ProtectedRoute>
  );
};

// Component cho các routes cần đăng nhập nhưng không yêu cầu role cụ thể
export const AuthProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute; 