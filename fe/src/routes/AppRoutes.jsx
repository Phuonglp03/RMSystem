import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ServantLayout from '../layouts/ServantLayout';
import { AdminProtectedRoute, ServantProtectedRoute, AuthProtectedRoute } from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from '../pages/Home';
import Signup from '../pages/SignUp';
import Login from '../pages/LogIn';
import TableOrderTest from '../pages/BookingFood/TableOrderTest';
import BookingTable from '../pages/BookTable';
import Menu from '../pages/Menu';
import OrderHistoryByUser from '../pages/BookingFood/OrderHistoryByUser';
import UserProfile from '../pages/Profile';
import Servant_Manage_Reservation from '../pages/Servant_Manage_Reservations';
import Reservation_Statistics from '../pages/Reservation_Statistics';
import Reservation_History from '../pages/Reservation_History';
import Reservation_Notification from '../pages/Reservation_Notification';
import Reservation_Detail from '../pages/Reservation_Detail';
import Reservation_Create_By_Servant from '../pages/Reservation_Create_By_Servant';

// Admin Dashboard Components
import AdminDashboard from '../pages/AdminDashboard';
import UserManagement from '../pages/AdminDashboard/UserManagement';
import ComboManage from '../pages/AdminDashboard/Combo_Manage';
import FoodManage from '../pages/AdminDashboard/Food_Manage';
import FoodCategoryManage from '../pages/AdminDashboard/FoodCategory_Manage';
import NotFound from '../components/NotFound';
import RootRedirect from '../components/RootRedirect';

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            {/* Main Public Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={
                    <>
                        <RootRedirect />
                        <HomePage />
                    </>
                } />
                <Route path='menu' element={<Menu />} />
                <Route path='book-table' element={<BookingTable />} />
                <Route path='test-table-order' element={<TableOrderTest />} />
                <Route path='order-history' element={<OrderHistoryByUser />} />
                <Route path='profile' element={<UserProfile />} />
            </Route>

            {/* Auth Routes */}
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="food-categories" element={<FoodCategoryManage />} />
                <Route path="foods" element={<FoodManage />} />
                <Route path="combos" element={<ComboManage />} />
            </Route>

            {/* Servant Routes - Protected */}
            <Route path="/servant" element={
                <ServantProtectedRoute>
                    <ServantLayout />
                </ServantProtectedRoute>
            }>
                <Route path="manage-reservation" element={<Servant_Manage_Reservation />} />
                <Route path="reservation-statistics" element={<Reservation_Statistics />} />
                <Route path="reservation-history" element={<Reservation_History />} />
                <Route path="reservation-notification" element={<Reservation_Notification />} />
                <Route path="reservation-detail/:id" element={<Reservation_Detail />} />
                <Route path="reservation-create" element={<Reservation_Create_By_Servant />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;