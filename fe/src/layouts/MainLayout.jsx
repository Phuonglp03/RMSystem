import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
const { Content } = Layout;

const MainLayout = () => {

  
  return (
    <div className="main-layout">
      <Layout>
        <Header />
        <Content style={{ marginTop: 126, minHeight: 'calc(100vh - 64px - 100px)' }}>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </div>
  );
};

export default MainLayout;