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
    getStaffById
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

module.exports = router 