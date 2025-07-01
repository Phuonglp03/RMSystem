import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from '../pages/Home';
import Signup from '../pages/SignUp';
import Login from '../pages/LogIn';
import TableOrderTest from '../pages/BookingFood/TableOrderTest';
import BookingTable from '../pages/BookTable';
import Menu from '../pages/Menu';
import OrderHistoryByUser from '../pages/BookingFood/OrderHistoryByUser';
import UserProfile from '../pages/Profile';
import ServantLayout from '../layouts/ServantLayout'
import Servant_Manage_Reservation from '../pages/Servant_Manage_Reservations'
import Reservation_Statistics from '../pages/Reservation_Statistics'
import Reservation_History from '../pages/Reservation_History'
import Reservation_Notification from '../pages/Reservation_Notification'
import Reservation_Detail from '../pages/Reservation_Detail'
import Reservation_Create_By_Servant from '../pages/Reservation_Create_By_Servant'
import ComboManage from '../pages/Combo_Manage'
import FoodManage from '../pages/Food_Manage'
import FoodCategoryManage from '../pages/FoodCategory_Manage'
import Assigned_Table_By_Servant from '../pages/Assigned_Table_By_Servant';
import Confirm_Customer_Arrived from '../pages/Confirm_Customer_Arrived';

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />

                <Route path='/menu' element={<Menu />} />
                <Route path='/book-table' element={<BookingTable />} />
                <Route path='/test-table-order' element={<TableOrderTest />} />
                <Route path='/order-history' element={<OrderHistoryByUser />} />
                <Route path='/profile' element={<UserProfile />} />
                <Route path="combo-manage" element={<ComboManage />} />
                <Route path="food-manage" element={<FoodManage />} />
                <Route path="food-category-manage" element={<FoodCategoryManage />} />
            </Route>
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

            <Route path='/order-history' element={<OrderHistoryByUser />} />
            <Route path="/servant" element={<ServantLayout />} >
                <Route path="manage-reservation" element={<Servant_Manage_Reservation />} />
                <Route path="reservation-statistics" element={<Reservation_Statistics />} />
                <Route path="reservation-history" element={<Reservation_History />} />
                <Route path="reservation-notification" element={<Reservation_Notification />} />
                <Route path="reservation-detail/:id" element={<Reservation_Detail />} />
                <Route path="reservation-create" element={<Reservation_Create_By_Servant />} />
                <Route path="assigned-tables" element={<Assigned_Table_By_Servant />} />
                <Route path="confirm-guest-arrive" element={<Confirm_Customer_Arrived />} />
            </Route>
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

        </Routes>
    </BrowserRouter>
);

export default AppRoutes;