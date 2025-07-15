const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/authMiddleware')
const { adminOnly } = require('../middleware/roleMiddleware')
const {
    createStaffAccount,
    getAllStaff,
    updateStaffAccount,
    deactivateStaffAccount,
    activateStaffAccount,
    resetStaffPassword,
    getStaffById,
    getDashboardStats,
    getRevenueStats,
    getReservationStats,
    getStaffStats,
    getCustomerStats
} = require('../controllers/admin.controller')

// Apply auth middleware và admin role check cho tất cả routes
router.use(authMiddleware)
router.use(adminOnly)

// POST /api/admin/staff - Tạo tài khoản staff (servant, chef, admin)
router.post('/staff', createStaffAccount)

// GET /api/admin/staff - Lấy danh sách tất cả staff
// Query params: ?role=chef&page=1&limit=10&search=john
router.get('/staff', getAllStaff)

// GET /api/admin/staff/:userId - Lấy thông tin staff theo ID
router.get('/staff/:userId', getStaffById)

// PUT /api/admin/staff/:userId - Cập nhật thông tin staff
router.put('/staff/:userId', updateStaffAccount)

// PATCH /api/admin/staff/:userId/deactivate - Vô hiệu hóa tài khoản staff
router.patch('/staff/:userId/deactivate', deactivateStaffAccount)

// PATCH /api/admin/staff/:userId/activate - Kích hoạt tài khoản staff
router.patch('/staff/:userId/activate', activateStaffAccount)

// PATCH /api/admin/staff/:userId/reset-password - Reset password cho staff
router.patch('/staff/:userId/reset-password', resetStaffPassword)

// Statistics routes
// GET /api/admin/stats/dashboard - Thống kê tổng quan dashboard
router.get('/stats/dashboard', getDashboardStats)

// GET /api/admin/stats/revenue - Thống kê doanh thu
// Query params: ?period=week|month|year&startDate=2024-01-01&endDate=2024-12-31
router.get('/stats/revenue', getRevenueStats)

// GET /api/admin/stats/reservations - Thống kê đặt bàn
// Query params: ?period=week|month|year&startDate=2024-01-01&endDate=2024-12-31
router.get('/stats/reservations', getReservationStats)

// GET /api/admin/stats/staff - Thống kê hiệu suất nhân viên
// Query params: ?period=week|month|year&startDate=2024-01-01&endDate=2024-12-31
router.get('/stats/staff', getStaffStats)

// GET /api/admin/stats/customers - Thống kê khách hàng
// Query params: ?period=week|month|year&startDate=2024-01-01&endDate=2024-12-31
router.get('/stats/customers', getCustomerStats)

module.exports = router 