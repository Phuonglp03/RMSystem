import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminProtectedRoute = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/" />;
  if (user?.role !== 'admin') return <Navigate to="/unauthorized" />;
  return <Outlet />;
};

export const ChefProtectedRoute = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/" />;
  if (user?.role !== 'chef') return <Navigate to="/unauthorized" />;
  return <Outlet />;
};

export const ServantProtectedRoute = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/" />;
  if (user?.role !== 'servant') return <Navigate to="/unauthorized" />;
  return <Outlet />;
}; 