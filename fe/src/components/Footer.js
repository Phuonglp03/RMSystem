import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '24px 50px', background: '#f0f2f5' }}>
      <div style={{ marginBottom: 20 }}>
        <img 
          src="/logo.png" 
          alt="BỰ Restaurant" 
          style={{ 
            height: 50, 
            marginRight: 10 

          }} 
        />
        <Title level={4} style={{ marginBottom: 0, marginTop: 0, display: "inline-block" }}>
        The Fool Restaurant
        </Title>
      </div>
      <Paragraph>
        © {new Date().getFullYear()} The Fool Restaurant. Tất cả các quyền được bảo lưu.
      </Paragraph>
      <Paragraph>
        Địa chỉ: FPT University, Hòa Lạc | Điện thoại: 0904 628 569 | Email: phuongtvhe172048@fpt.edu.vn
      </Paragraph>
    </footer>
  );
};

export default Footer;