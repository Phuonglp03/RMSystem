import React from 'react';
import { Typography } from 'antd';
import { MinimalLogo } from './Logo';
const { Title, Paragraph } = Typography;

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '24px 50px', background: '#f0f2f5' }}>
      <div style={{ marginBottom: 20 }}>
        <MinimalLogo />
        
      </div>
      <Paragraph>
        © {new Date().getFullYear()} The Fool Restaurant. 
      </Paragraph>
      <Paragraph>
        Địa chỉ: FPT University, Hòa Lạc | Điện thoại: 0904 628 569 | Email: phuongtvhe172048@fpt.edu.vn
      </Paragraph>
    </footer>
  );
};

export default Footer;