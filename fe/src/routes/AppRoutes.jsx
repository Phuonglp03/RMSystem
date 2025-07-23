import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminProtectedRoute, ServantProtectedRoute } from '../components/ProtectedRoute';
import ScrollToTop from '../components/ScrollToTop';
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';
import ServantLayout from '../layouts/ServantLayout';
import ServantTableManage from '../pages/ServantDashboard/TableManage';
import OrderHistoryByUser from '../pages/BookingFood/OrderHistoryByUser';
import TableOrderTest from '../pages/BookingFood/TableOrderTest';
import BookingTable from '../pages/BookTable';
import HomePage from '../pages/Home';
import Login from '../pages/LogIn';
import Menu from '../pages/Menu';
import FoodDetail from '../pages/FoodDetail';
import ComboDetail from '../pages/ComboDetail';
import UserProfile from '../pages/Profile';
import Signup from '../pages/SignUp';
import PaymentCallback from '../pages/payment-callback';
import Vouchers from '../pages/Vouchers';

// Admin Dashboard Components
import NotFound from '../components/NotFound';
import RootRedirect from '../components/RootRedirect';
import ComboManage from '../pages/AdminDashboard/Combo_Manage';
import FoodManage from '../pages/AdminDashboard/Food_Manage';
import FoodCategoryManage from '../pages/AdminDashboard/FoodCategory_Manage';
import AdminStatistics from '../pages/AdminDashboard/Statistics';
import UserManagement from '../pages/AdminDashboard/UserManagement';
import TableManage from '../pages/AdminDashboard/Table_Manage';
import Voucher_Manage from '../pages/AdminDashboard/Voucher_Manage';

import ChefDashboard from '../pages/Chef/ChefDashboard';
import InventoryDashboard from '../pages/Inventory/InventoryDashboard';
import RevenueReport from '../pages/AdminDashboard/Statistics/RevenueReport';
import ReservationManage from '../pages/ServantDashboard/ReservationManage';

const AppRoutes = () => (
    <BrowserRouter>
        <ScrollToTop />
        <Routes>
            {/* Main Public Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={
                    <>
                        <RootRedirect />
                        <HomePage />
                    </>
                } />
                <Route path='vouchers' element={<Vouchers />} />
                <Route path='menu' element={<Menu />} />
                <Route path='food/:id' element={<FoodDetail />} />
                <Route path='combo/:id' element={<ComboDetail />} />
                <Route path='book-table' element={<BookingTable />} />
                <Route path='test-table-order' element={<TableOrderTest />} />
                <Route path='order-history' element={<OrderHistoryByUser />} />
                <Route path='profile' element={<UserProfile />} />
                <Route path='payment-callback' element={<PaymentCallback />} />
            </Route>

            {/* Auth Routes */}
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

            {/* Servant Routes - Protected */}
            <Route path="/servant" element={<ServantLayout />}>
                <Route path="tables" element={<ServantTableManage />} />
                <Route path="reservations" element={<ReservationManage />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            }>
                <Route index element={<AdminStatistics />} />
                <Route path="tables" element={<TableManage />} />
                <Route path="statistics" element={<AdminStatistics />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="food-categories" element={<FoodCategoryManage />} />
                <Route path="foods" element={<FoodManage />} />
                <Route path="combos" element={<ComboManage />} />
                <Route path="voucher" element={<Voucher_Manage />} />

                <Route path="chef" element={<ChefDashboard />} />
                <Route path="inventory" element={<InventoryDashboard />} />
                <Route path="revenue" element={<RevenueReport />} />


            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;