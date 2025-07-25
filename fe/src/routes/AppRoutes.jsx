import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

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
import ReservationDetail from '../pages/Profile/ReservationDetail';

// Admin Dashboard Components
import NotFound from '../components/NotFound';
import ComboManage from '../pages/AdminDashboard/Combo_Manage';
import FoodManage from '../pages/AdminDashboard/Food_Manage';
import FoodCategoryManage from '../pages/AdminDashboard/FoodCategory_Manage';
import AdminStatistics from '../pages/AdminDashboard/Statistics';
import UserManagement from '../pages/AdminDashboard/UserManagement';
import TableManage from '../pages/AdminDashboard/Table_Manage';
import Voucher_Manage from '../pages/AdminDashboard/Voucher_Manage';

import ChefLayout from '../layouts/ChefLayout';
import ChefOrders from '../pages/Chef/Orders';
import InventoryDashboard from '../pages/Inventory/InventoryDashboard';
import RevenueReport from '../pages/AdminDashboard/Statistics/RevenueReport';
import ReservationManage from '../pages/ServantDashboard/ReservationManage';
import ServantOrder from '../pages/ServantDashboard/ServantOrder';
import { AdminProtectedRoute, ServantProtectedRoute, ChefProtectedRoute } from '../components/ProtectedRoute';
import UnauthorizedAccess from '../components/UnauthorizedAccess';

const AppRoutes = () => (
    <BrowserRouter>
        <ScrollToTop />
        <Routes>
            {/* Main Public Routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={  <HomePage /> } />
                <Route path='vouchers' element={<Vouchers />} />
                <Route path='menu' element={<Menu />} />
                <Route path='food/:id' element={<FoodDetail />} />
                <Route path='combo/:id' element={<ComboDetail />} />
                <Route path='book-table' element={<BookingTable />} />
                <Route path='booking-food/table-order' element={<TableOrderTest />} />
                <Route path='order-history' element={<OrderHistoryByUser />} />
                <Route path='profile' element={<UserProfile />} />
                <Route path='payment-callback' element={<PaymentCallback />} />
                <Route path="/reservation/:id" element={<ReservationDetail />} />
            </Route>

            {/* Auth Routes */}
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

            {/* Servant Protected Routes */}
            <Route path="/servant" element={<ServantProtectedRoute />}>
                <Route element={<ServantLayout />}>
                    <Route index element={<ServantTableManage />} />
                    <Route path="reservations" element={<ReservationManage />} />
                    <Route path="orders" element={<ServantOrder />} />
                </Route>
            </Route>

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<AdminStatistics />} />
                    <Route path="tables" element={<TableManage />} />
                    <Route path="statistics" element={<AdminStatistics />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="food-categories" element={<FoodCategoryManage />} />
                    <Route path="foods" element={<FoodManage />} />
                    <Route path="combos" element={<ComboManage />} />
                    <Route path="voucher" element={<Voucher_Manage />} />
                    <Route path="inventory" element={<InventoryDashboard />} />
                    <Route path="revenue" element={<RevenueReport />} />
                </Route>
            </Route>

            {/* Chef Protected Routes */}
            <Route path="/chef" element={<ChefProtectedRoute />}>
                <Route element={<ChefLayout />}>
                    <Route  index element={<ChefOrders />} />
                </Route>
            </Route>

            {/* 404 Route */}
            <Route path="unauthorized" element={<UnauthorizedAccess />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;