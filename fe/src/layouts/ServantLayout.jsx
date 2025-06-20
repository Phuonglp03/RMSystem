import { Layout } from 'antd'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
const { Content } = Layout

const ServantLayout = () => {
    return (
        <div>
            <Layout>
                <Header />
                <Content style={{ marginTop: 64, minHeight: 'calc(100vh - 64px - 100px)' }}>
                    <Outlet />
                </Content>
                <Footer />
            </Layout>
        </div>
    )
}

export default ServantLayout
