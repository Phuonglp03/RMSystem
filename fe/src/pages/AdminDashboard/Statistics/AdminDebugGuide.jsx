import React from 'react';
import { Card, Steps, Alert, Typography, Tag, Space } from 'antd';

const { Title, Text, Paragraph } = Typography;

const AdminDebugGuide = () => {
  return (
    <Card title="🔧 Hướng dẫn Debug Trang Thống Kê Admin" style={{ margin: '20px 0' }}>
      <Alert
        message="Trang thống kê không hoạt động?"
        description="Làm theo các bước dưới đây để tìm và khắc phục lỗi"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Steps
        direction="vertical"
        current={-1}
        items={[
          {
            title: 'Kiểm tra Quyền Admin',
            description: (
              <div>
                <Paragraph>
                  Đảm bảo bạn đang đăng nhập với tài khoản có <Tag color="red">role: admin</Tag>
                </Paragraph>
                <ul>
                  <li>Kiểm tra token JWT trong localStorage</li>
                  <li>Verify role trong token payload</li>
                  <li>Đảm bảo token chưa hết hạn</li>
                </ul>
              </div>
            ),
          },
          {
            title: 'Test API Connection',
            description: (
              <div>
                <Paragraph>
                  Sử dụng nút <Tag color="blue">"Test Admin API"</Tag> để kiểm tra kết nối
                </Paragraph>
                <ul>
                  <li>API trả về status 200: ✅ Kết nối OK</li>
                  <li>API trả về status 401: ❌ Token không hợp lệ</li>
                  <li>API trả về status 403: ❌ Không có quyền admin</li>
                  <li>Network Error: ❌ Vấn đề kết nối mạng</li>
                </ul>
              </div>
            ),
          },
          {
            title: 'Kiểm tra Console Log',
            description: (
              <div>
                <Paragraph>
                  Mở Developer Tools (F12) và kiểm tra Console
                </Paragraph>
                <ul>
                  <li>Tìm các log bắt đầu với 🔍, ✅, ❌</li>
                  <li>Kiểm tra error details từ API responses</li>
                  <li>Note lại URL và status codes</li>
                </ul>
              </div>
            ),
          },
          {
            title: 'Các Giải Pháp Thường Gặp',
            description: (
              <div>
                <Space direction="vertical">
                  <div>
                    <Tag color="orange">Lỗi 401:</Tag>
                    <Text> Đăng xuất và đăng nhập lại</Text>
                  </div>
                  <div>
                    <Tag color="red">Lỗi 403:</Tag>
                    <Text> Liên hệ admin để cấp quyền</Text>
                  </div>
                  <div>
                    <Tag color="purple">Network Error:</Tag>
                    <Text> Kiểm tra kết nối internet và server status</Text>
                  </div>
                  <div>
                    <Tag color="green">Data NaN:</Tag>
                    <Text> Đã được fix tự động với safe values</Text>
                  </div>
                </Space>
              </div>
            ),
          },
        ]}
      />

      <Alert
        message="💡 Tip"
        description="Nếu vẫn gặp lỗi, hãy chụp screenshot console log và báo cho developer"
        type="success"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default AdminDebugGuide; 