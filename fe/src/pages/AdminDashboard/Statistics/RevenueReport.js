import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  DatePicker,
  message,
  Button,
  Space,
  Select,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueReport = () => {
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [status, setStatus] = useState("completed"); // mặc định chỉ lấy completed
  const [statusStats, setStatusStats] = useState([]);
  const [updatedRevenueStats, setUpdatedRevenueStats] = useState([]);

  const fetchUpdatedRevenueStats = async () => {
    try {
      const params = {};
      if (dateRange.length === 2) {
        params.start = dateRange[0].startOf("day").toISOString();
        params.end = dateRange[1].endOf("day").toISOString();
      }

      const res = await axios.get(
        "http://localhost:9999/api/reports/revenue/by-updated-date",
        {
          params,
        }
      );

      setUpdatedRevenueStats(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy thống kê theo updatedAt:", err);
    }
  };

  const fetchStatusStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:9999/api/reports/revenue/status-stats"
      );
      setStatusStats(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê trạng thái:", err);
    }
  };
  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const params = { status }; // thêm status vào query
      if (dateRange.length === 2) {
        params.start = dateRange[0].startOf("day").toISOString();
        params.end = dateRange[1].endOf("day").toISOString();
      }
      const res = await axios.get("http://localhost:9999/api/reports/revenue", {
        params,
      });
      setData(res.data.orders || []);

      setTotalRevenue(res.data.total || 0);
    } catch (err) {
      message.error("Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchStatusStats();
    fetchUpdatedRevenueStats();
  }, []);

  const columns = [
    {
      title: "Ngày hoàn thành",
      dataIndex: "updatedAt",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Bàn",
      dataIndex: "tableId",
      render: (val) => {
        if (!val) return "—";
        const tableNumber = val.tableNumber || val.name || val._id;
        return `Bàn ${tableNumber}`;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalprice",
      render: (value) =>
        typeof value === "number" ? `${value.toLocaleString("vi-VN")} đ` : "—",
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={3}>📈 Báo cáo doanh thu</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          format="DD/MM/YYYY"
          value={dateRange}
          onChange={(values) => setDateRange(values || [])}
        />
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          style={{ width: 160 }}
        >
          <Option value="completed">✅ Hoàn thành</Option>
          <Option value="pending">🕓 Chờ xử lý</Option>
          <Option value="canceled">❌ Đã hủy</Option>
          <Option value="all">📋 Tất cả</Option>
        </Select>
        <Button type="primary" onClick={fetchRevenue}>
          Lọc
        </Button>
        <Button
          onClick={() => {
            setDateRange([]);
            setStatus("completed");
            fetchRevenue();
          }}
        >
          Mặc định
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell
              index={0}
              colSpan={2}
              style={{ fontWeight: "bold" }}
            >
              Tổng doanh thu
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} style={{ fontWeight: "bold" }}>
              {typeof totalRevenue === "number"
                ? `${totalRevenue.toLocaleString("vi-VN")} đ`
                : "—"}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div style={{ marginTop: 40 }}>
        <Title level={4}>📅 Doanh thu theo ngày cập nhật đơn</Title>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={updatedRevenueStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
            <Bar dataKey="total" fill="#82ca9d" name="Tổng doanh thu" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 40 }}>
        <Title level={4}>📊 Biểu đồ trạng thái đơn hàng</Title>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueReport;
