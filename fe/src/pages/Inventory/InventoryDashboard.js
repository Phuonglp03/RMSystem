import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Input,
  Tag,
  Typography,
  Space,
  Pagination,
  message,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const PAGE_SIZE = 6;

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isAddIngredientVisible, setIsAddIngredientVisible] = useState(false);
  const [ingredientForm] = Form.useForm();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://localhost:9999/api/inventory");
      setInventory(res.data);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu kho!");
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:9999/api/ingredients");
      setIngredients(res.data);
    } catch (err) {
      message.error("Không thể tải nguyên liệu!");
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:9999/api/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchInventory();
    fetchIngredients();
    fetchCategories();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const name = item.ingredientId?.name || "";
    return name.toLowerCase().includes(searchText.toLowerCase());
  });

  const paginated = filteredInventory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleRestock = async (values) => {
    try {
      await axios.post("http://localhost:9999/api/inventory/restock", values);
      message.success("✅ Nhập kho thành công");
      setIsModalVisible(false);
      form.resetFields();
      fetchInventory();
    } catch (err) {
      message.error("❌ Lỗi khi nhập kho");
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      ingredientId: item.ingredientId?._id,
      currentQuantity: item.currentQuantity,
    });
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:9999/api/inventory/${editingItem._id}`, {
        ingredientId: values.ingredientId,
        currentQuantity: values.currentQuantity,
      });
      message.success("✅ Đã cập nhật");
      setIsEditModalVisible(false);
      fetchInventory();
    } catch (err) {
      message.error("❌ Lỗi khi cập nhật");
    }
  };

  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: ["ingredientId", "name"],
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "currentQuantity",
      key: "currentQuantity",
      render: (qty, record) => {
        const warning = qty <= record.minimumThreshold;
        return (
          <span style={{ fontWeight: warning ? "bold" : "normal" }}>
            {qty} {record.ingredientId?.unit || ""}
            {warning && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                Thấp
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      title: "Ngưỡng tối thiểu",
      dataIndex: "minimumThreshold",
      key: "minimumThreshold",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) => `${price?.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "HSD",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Nhập lần cuối",
      dataIndex: "lastRestockedDate",
      key: "lastRestockedDate",
      render: (date) => (date ? new Date(date).toLocaleString("vi-VN") : "—"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => openEditModal(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        📦 Quản lý kho
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Input
          placeholder="🔍 Tìm nguyên liệu..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: 400 }}
          allowClear
        />
        <div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalVisible(true)}
          >
            Nhập kho mới
          </Button>
          <Button
            icon={<PlusOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => setIsAddIngredientVisible(true)}
          >
            ➕ Thêm nguyên liệu
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={paginated}
        rowKey="_id"
        pagination={false}
        bordered
      />

      {filteredInventory.length > PAGE_SIZE && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Pagination
            current={currentPage}
            pageSize={PAGE_SIZE}
            total={filteredInventory.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Modal Nhập kho */}
      <Modal
        title="📥 Nhập kho nguyên liệu"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleRestock}>
          <Form.Item
            label="Nguyên liệu"
            name="ingredientId"
            rules={[{ required: true, message: "Chọn nguyên liệu" }]}
          >
            <Select placeholder="Chọn nguyên liệu">
              {ingredients.map((ing) => (
                <Select.Option key={ing._id} value={ing._id}>
                  {ing.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Đơn giá (VNĐ)"
            name="unitPrice"
            rules={[{ required: true, message: "Nhập đơn giá" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Hạn sử dụng" name="expiryDate">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm nguyên liệu */}
      <Modal
        title="➕ Thêm nguyên liệu mới"
        visible={isAddIngredientVisible}
        onCancel={() => setIsAddIngredientVisible(false)}
        onOk={() => ingredientForm.submit()}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={ingredientForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await axios.post(
                "http://localhost:9999/api/inventory/create-with-ingredient",
                values
              );
              message.success("✅ Đã thêm nguyên liệu");
              setIsAddIngredientVisible(false);
              ingredientForm.resetFields();
              fetchIngredients();
              fetchInventory();
            } catch (err) {
              message.error("❌ Lỗi khi thêm nguyên liệu");
            }
          }}
        >
          <Form.Item
            label="Tên nguyên liệu"
            name="name"
            rules={[{ required: true, message: "Nhập tên nguyên liệu" }]}
          >
            <Input placeholder="Ví dụ: Muối, Đường..." />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit"
            rules={[{ required: true, message: "Nhập đơn vị (g, kg, ml...)" }]}
          >
            <Input placeholder="Ví dụ: g, kg, ml..." />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ngưỡng tối thiểu" name="minimumThreshold">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        title="✏️ Sửa nguyên liệu trong kho"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Nguyên liệu"
            name="ingredientId"
            rules={[{ required: true, message: "Chọn nguyên liệu" }]}
          >
            <Select placeholder="Chọn nguyên liệu">
              {ingredients.map((ing) => (
                <Select.Option key={ing._id} value={ing._id}>
                  {ing.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="currentQuantity"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;
