const express = require("express");
const router = express.Router();
const TableOrder = require("../models/TableOrder");

// GET /api/reports/revenue
router.get("/revenue", async (req, res) => {
  const { start, end, status } = req.query;

  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  } else if (!status) {
    filter.status = "completed";
  }

  if (start && end) {
    filter.completedAt = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  filter.totalprice = { $gt: 0 }; // ✅ loại bỏ đơn hàng 0đ

  try {
    const orders = await TableOrder.find(filter).populate('tableId').sort({ completedAt: -1 });

    const total = orders.reduce(
      (sum, order) => sum + (order.totalprice || 0),
      0
    );

    res.json({
      orders,
      total,
    });
  } catch (err) {
    console.error("Lỗi khi lấy doanh thu:", err);
    res.status(500).json({ message: "Lỗi server khi lấy báo cáo doanh thu" });
  }
});

// GET /api/reports/revenue/daily
router.get("/revenue/daily", async (req, res) => {
  const { start, end, status } = req.query;

  const match = {};

  if (status && status !== "all") {
    match.status = status;
  } else if (!status) {
    match.status = "completed";
  }

  if (start && end) {
    match.completedAt = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  match.totalprice = { $gt: 0 }; // ✅ bỏ doanh thu 0đ

  try {
    const data = await TableOrder.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          total: { $sum: "$totalprice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((item) => ({
      date: item._id,
      total: item.total,
    }));

    res.json(result);
  } catch (err) {
    console.error("Lỗi khi tính doanh thu theo ngày:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/reports/revenue/status-stats
router.get("/revenue/status-stats", async (req, res) => {
  try {
    const data = await TableOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    res.json(result);
  } catch (err) {
    console.error("Lỗi khi thống kê trạng thái:", err);
    res.status(500).json({ message: "Lỗi server khi thống kê trạng thái" });
  }
});


// GET /api/reports/revenue/by-updated-date
router.get('/revenue/by-updated-date', async (req, res) => {
  try {
    const { start, end } = req.query;

    const match = {};
    if (start && end) {
      match.updatedAt = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const data = await TableOrder.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          total: { $sum: "$totalprice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("❌ Lỗi thống kê theo updatedAt:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});


module.exports = router;
