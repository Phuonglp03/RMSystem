import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from '../pages/Home';
import Signup from '../pages/SignUp';
import Login from '../pages/LogIn';
import Servant_Dashboard from '../pages/Servant_Dashboard';
import Servant_Manage_Reservation from '../pages/Servant_Manage_Reservations';
import Reservation_Statistics from '../pages/Reservation_Statistics';
import Reservation_History from '../pages/Reservation_History';
import ServantLayout from '../layouts/ServantLayout';

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
            </Route>
            <Route path="/servant" element={<ServantLayout />} >
                <Route path="manage-reservation" element={<Servant_Manage_Reservation />} />
                <Route path="reservation-statistics" element={<Reservation_Statistics />} />
                <Route path="reservation-history" element={<Reservation_History />} />
            </Route>
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />

        </Routes>
    </BrowserRouter>
);

export default AppRoutes;