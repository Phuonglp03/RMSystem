import React, { useState } from 'react';
import { Layout, Modal } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Content } = Layout;

const MainLayout = () => {
  // States for cart functionality
  const [cartItems, setCartItems] = useState([]);
  const [cartModal, setCartModal] = useState(false);
  const [reservationModal, setReservationModal] = useState(false);

  // Context object to pass to child components
  const contextValue = {
    cartItems,
    setCartItems,
    cartModal,
    setCartModal,
    reservationModal,
    setReservationModal
  };

  return (
    <div className="main-layout">
      <Layout>
        <Header 
          cartItems={cartItems}
          setCartItems={setCartItems}
          cartModal={cartModal}
          setCartModal={setCartModal}
        />
        <Content style={{ marginTop: 126, minHeight: 'calc(100vh - 64px - 100px)' }}>
          <Outlet context={contextValue} />
        </Content>
        <Footer />
      </Layout>
    </div>
  );
};

export default MainLayout;