import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminProtectedRoute, ServantProtectedRoute } from '../components/ProtectedRoute';
import ScrollToTop from '../components/ScrollToTop';
import AdminLayout from '../layouts/AdminLayout';
import MainLayout from '../layouts/MainLayout';
import ServantLayout from '../layouts/ServantLayout';
import OrderHistoryByUser from '../pages/BookingFood/OrderHistoryByUser';
import TableOrderTest from '../pages/BookingFood/TableOrderTest';
import BookingTable from '../pages/BookTable';
import HomePage from '../pages/Home';
import Login from '../pages/LogIn';
import Menu from '../pages/Menu';
import FoodDetail from '../pages/FoodDetail';
import ComboDetail from '../pages/ComboDetail';
import UserProfile from '../pages/Profile';
import Reservation_Create_By_Servant from '../pages/Reservation_Create_By_Servant';
import Reservation_Detail from '../pages/Reservation_Detail';
import Reservation_History from '../pages/Reservation_History';
import Reservation_Notification from '../pages/Reservation_Notification';
import Reservation_Statistics from '../pages/Reservation_Statistics';
import Servant_Manage_Reservation from '../pages/Servant_Manage_Reservations';
import Signup from '../pages/SignUp';
import PaymentCallback from '../pages/payment-callback';

// Admin Dashboard Components
import NotFound from '../components/NotFound';
import RootRedirect from '../components/RootRedirect';
import ComboManage from '../pages/AdminDashboard/Combo_Manage';
import FoodManage from '../pages/AdminDashboard/Food_Manage';
import FoodCategoryManage from '../pages/AdminDashboard/FoodCategory_Manage';
import AdminStatistics from '../pages/AdminDashboard/Statistics';
import UserManagement from '../pages/AdminDashboard/UserManagement';
import Assigned_Table_By_Servant from '../pages/Assigned_Table_By_Servant';
import Confirm_Customer_Arrived from '../pages/Confirm_Customer_Arrived';
import Servant_Manage_Table_Order from '../pages/Servant_Manage_Table_Order';
import TableOrder_Assigned from '../pages/TableOrder_Assigned';
import TableOrder_Create_By_Servant from '../pages/TableOrder_Create_By_Servant';
import TableOrder_History from '../pages/TableOrder_History';
import TableOrder_Statistics from '../pages/TableOrder_Statistics';
import Servant_Layout from '../layouts/Servant_Layout';
import Servant_Daily_Statistics_Page from '../pages/Servant_Daily_Statistics_Page';
import Servant_Notification_Page from '../pages/Servant_Notification_Page';
import VoucherManage from '../pages/AdminDashboard/Voucher_Manage';
import TableOrder_Detail from '../pages/TableOrder_Detail';

import ChefDashboard from '../pages/Chef/ChefDashboard';
import InventoryDashboard from '../pages/Inventory/InventoryDashboard';
import RevenueReport from '../pages/AdminDashboard/Statistics/RevenueReport';

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

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            }>
                <Route index element={<AdminStatistics />} />
                <Route path="statistics" element={<AdminStatistics />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="food-categories" element={<FoodCategoryManage />} />
                <Route path="foods" element={<FoodManage />} />
                <Route path="combos" element={<ComboManage />} />
                <Route path="voucher" element={<VoucherManage />} />

                <Route path="chef" element={<ChefDashboard />} />
                <Route path="inventory" element={<InventoryDashboard />} />
                <Route path="revenue" element={<RevenueReport />} />


            </Route>

            {/* Servant Routes - Protected */}
            <Route path="/servant" element={
                <ServantProtectedRoute>
                    <Servant_Layout />
                </ServantProtectedRoute>
            }>
                <Route path="manage-reservation" element={<Servant_Manage_Reservation />} />
                <Route path="statistics" element={<Servant_Daily_Statistics_Page />} />
                <Route path="notifications" element={<Servant_Notification_Page />} />
                <Route path="reservation-history" element={<Reservation_History />} />
                <Route path="reservation-notification" element={<Reservation_Notification />} />
                <Route path="reservation-detail/:id" element={<Reservation_Detail />} />
                <Route path="reservation-create" element={<Reservation_Create_By_Servant />} />
                <Route path="assigned-tables" element={<Assigned_Table_By_Servant />} />
                <Route path="confirm-guest-arrive" element={<Confirm_Customer_Arrived />} />
                <Route path="manage-tableOrder" element={<Servant_Manage_Table_Order />} />
                <Route path="table-order-history" element={<TableOrder_History />} />
                <Route path='table-order-detail/:id' element={<TableOrder_Detail />} />
                <Route path="assigned-order" element={<TableOrder_Assigned />} />
                <Route path="table-order-create" element={<TableOrder_Create_By_Servant />} />
                <Route path="table-order-statistics" element={<TableOrder_Statistics />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;