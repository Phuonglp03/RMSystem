const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Customer = require('../models/Customer')
const Admin = require('../models/Admin')
const Chef = require('../models/Chef')
const Servant = require('../models/Servant')
const Reservation = require('../models/Reservation');
const TableOrder = require('../models/TableOrder');
const Table = require('../models/Table');
const Food = require('../models/Food');
const Combo = require('../models/Combo');
const mongoose = require('mongoose');

// Admin tạo tài khoản cho staff (servant, chef) và admin khác
const createStaffAccount = async (req, res) => {
    try {
        const { fullname, username, email, phone, password, dateOfBirth, gender, role } = req.body

        // Validate required fields
        if (!username || !email || !password || !role) {
            return res.status(400).json({
                message: 'Username, email, password và role là bắt buộc'
            })
        }

        // Validate role - chỉ cho phép tạo staff roles
        const allowedRoles = ['servant', 'chef', 'admin']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: 'Chỉ có thể tạo tài khoản servant, chef hoặc admin'
            })
        }

        // OPTION 1: Hạn chế tạo admin - chỉ super admin mới tạo được admin khác
        // Uncomment dòng dưới nếu muốn hạn chế
        if (role === 'admin' && req.jwtDecode?.email !== 'lmhthoai1@gmail.com') {
            return res.status(403).json({
                message: 'Chỉ Super Admin mới có thể tạo tài khoản Admin khác'
            })
        }

        // OPTION 2: Log việc tạo admin để audit
        if (role === 'admin') {
            console.log(`⚠️  ADMIN CREATION: ${req.jwtDecode?.email} đang tạo tài khoản admin cho ${email}`)
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Email không hợp lệ'
            })
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password phải có ít nhất 6 ký tự'
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'Email hoặc username đã tồn tại'
            })
        }

        // Hash password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Create user
        const newUser = new User({
            fullname,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            role,
            verified: true, // Staff accounts are pre-verified
            active: true
        })

        const savedUser = await newUser.save()

        // Create role-specific record
        let roleSpecificData = null
        switch (role) {
            case 'admin':
                roleSpecificData = await new Admin({
                    userId: savedUser._id
                }).save()
                break
            case 'chef':
                roleSpecificData = await new Chef({
                    userId: savedUser._id,
                    specialties: [],
                    experiencedYear: 0,
                    status: ['available'] // Giữ nguyên theo yêu cầu user
                }).save()
                break
            case 'servant':
                roleSpecificData = await new Servant({
                    userId: savedUser._id,
                    assignedTables: [],
                    status: ['available'] // Giữ nguyên theo yêu cầu user
                }).save()
                break
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser.toObject()

        res.status(201).json({
            message: `Tạo tài khoản ${role} thành công`,
            user: userWithoutPassword,
            roleData: roleSpecificData,
            createdBy: req.jwtDecode?.email
        })

    } catch (err) {
        console.error('Create staff account error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi trong quá trình tạo tài khoản',
            error: err.message
        })
    }
}

// Lấy danh sách tất cả staff
const getAllStaff = async (req, res) => {
    try {
        const { role, page = 1, limit = 10, search } = req.query

        // Build query
        let query = { role: { $in: ['admin', 'chef', 'servant', 'customer'] } }
        
        if (role && ['admin', 'chef', 'servant', 'customer'].includes(role)) {
            query.role = role
        }

        if (search) {
            query.$or = [
                { fullname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        }

        const skip = (page - 1) * limit
        const total = await User.countDocuments(query)

        const staff = await User.find(query)
            .select('-password -verificationToken -verificationTokenExpired')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        res.status(200).json({
            message: 'Lấy danh sách staff thành công',
            data: staff,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })

    } catch (err) {
        console.error('Get all staff error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi lấy danh sách staff',
            error: err.message
        })
    }
}



// Xóa/vô hiệu hóa tài khoản staff
const deactivateStaffAccount = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy user'
            })
        }

        // Không cho phép tự xóa chính mình
        if (user._id.toString() === req.jwtDecode?.id) {
            return res.status(403).json({
                message: 'Không thể vô hiệu hóa tài khoản của chính mình'
            })
        }

       

        user.active = false
        await user.save()

        // Log action
        console.log(`🚫 ACCOUNT DEACTIVATED: ${req.jwtDecode?.email} đã vô hiệu hóa tài khoản ${user.email}`)

        res.status(200).json({
            message: 'Vô hiệu hóa tài khoản thành công',
            deactivatedUser: user.email,
            deactivatedBy: req.jwtDecode?.email
        })

    } catch (err) {
        console.error('Deactivate staff account error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi vô hiệu hóa tài khoản',
            error: err.message
        })
    }
}

// Kích hoạt tài khoản staff
const activateStaffAccount = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy user'
            })
        }

        user.active = true
        await user.save()

        // Log action
        console.log(`✅ ACCOUNT ACTIVATED: ${req.jwtDecode?.email} đã kích hoạt tài khoản ${user.email}`)

        res.status(200).json({
            message: 'Kích hoạt tài khoản thành công',
            activatedUser: user.email,
            activatedBy: req.jwtDecode?.email
        })

    } catch (err) {
        console.error('Activate staff account error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi kích hoạt tài khoản',
            error: err.message
        })
    }
}

// Lấy thông tin staff theo ID
const getStaffById = async (req, res) => {
    try {
        const { userId } = req.params

        const user = await User.findById(userId)
            .select('-password -verificationToken -verificationTokenExpired')

        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy user'
            })
        }

        res.status(200).json({
            message: 'Lấy thông tin staff thành công',
            data: user
        })

    } catch (err) {
        console.error('Get staff by ID error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi lấy thông tin staff',
            error: err.message
        })
    }
}

// Cập nhật thông tin staff
const updateStaffAccount = async (req, res) => {
    try {
        const { userId } = req.params
        const { fullname, username, email, phone, dateOfBirth, gender, role, active } = req.body

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy user'
            })
        }

        // Không cho phép tự cập nhật role của chính mình
        if (user._id.toString() === req.jwtDecode?.id && role && role !== user.role) {
            return res.status(403).json({
                message: 'Không thể thay đổi role của chính mình'
            })
        }

        // Validate email format nếu có thay đổi
        if (email && email !== user.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    message: 'Email không hợp lệ'
                })
            }

            // Check if email already exists
            const existingUser = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: userId }
            })

            if (existingUser) {
                return res.status(409).json({
                    message: 'Email đã tồn tại'
                })
            }
        }

        // Check if username already exists
        if (username && username !== user.username) {
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: userId }
            })

            if (existingUser) {
                return res.status(409).json({
                    message: 'Username đã tồn tại'
                })
            }
        }

        // Update fields
        if (fullname !== undefined) user.fullname = fullname
        if (username !== undefined) user.username = username.toLowerCase()
        if (email !== undefined) user.email = email.toLowerCase()
        if (phone !== undefined) user.phone = phone
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
        if (gender !== undefined) user.gender = gender
        if (role !== undefined) user.role = role
        if (active !== undefined) user.active = active

        const updatedUser = await user.save()

        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser.toObject()

        // Log action
        console.log(`📝 STAFF UPDATED: ${req.jwtDecode?.email} đã cập nhật thông tin ${user.email}`)

        res.status(200).json({
            message: 'Cập nhật thông tin staff thành công',
            user: userWithoutPassword,
            updatedBy: req.jwtDecode?.email
        })

    } catch (err) {
        console.error('Update staff account error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi cập nhật thông tin staff',
            error: err.message
        })
    }
}

// Reset password cho staff
const resetStaffPassword = async (req, res) => {
    try {
        const { userId } = req.params
        const { newPassword } = req.body

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: 'Password mới phải có ít nhất 6 ký tự'
            })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy user'
            })
        }

        // Chỉ cho phép reset password cho staff
        if (!['admin', 'chef', 'servant'].includes(user.role)) {
            return res.status(403).json({
                message: 'Chỉ có thể reset password cho tài khoản staff'
            })
        }

        // Hash new password
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
        
        user.password = hashedPassword
        await user.save()

        // Log action
        console.log(`🔑 PASSWORD RESET: ${req.jwtDecode?.email} đã reset password cho ${user.email}`)

        res.status(200).json({
            message: 'Reset password thành công',
            targetUser: user.email,
            resetBy: req.jwtDecode?.email
        })

    } catch (err) {
        console.error('Reset staff password error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi reset password',
            error: err.message
        })
    }
}

// Admin Statistics - Dashboard Overview
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalServants = await Servant.countDocuments();
    const totalTables = await Table.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalCombos = await Combo.countDocuments();

    // Reservation stats
    const totalReservations = await Reservation.countDocuments();
    const todayReservations = await Reservation.countDocuments({
      startTime: { $gte: startOfToday }
    });
    const monthReservations = await Reservation.countDocuments({
      startTime: { $gte: startOfMonth }
    });

    // Revenue calculation from TableOrders
    const totalRevenue = await TableOrder.aggregate([
      { $group: { _id: null, total: { $sum: "$totalprice" } } }
    ]);

    const todayRevenue = await TableOrder.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$totalprice" } } }
    ]);

    const monthRevenue = await TableOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalprice" } } }
    ]);

    // Status breakdown
    const reservationsByStatus = await Reservation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const tableOrdersByStatus = await TableOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCustomers,
          totalServants,
          totalTables,
          totalFoods,
          totalCombos,
          totalReservations,
          todayReservations,
          monthReservations
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          today: todayRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0
        },
        breakdowns: {
          reservationsByStatus,
          tableOrdersByStatus
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message
    });
  }
};

// Revenue Statistics with time periods
const getRevenueStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let groupBy, dateRange;

    const now = new Date();
    
    // Set date range based on period
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: weekAgo };
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateRange = { $gte: monthAgo };
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateRange = { $gte: yearAgo };
          groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
          break;
        default:
          const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { $gte: defaultStart };
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      }
    }

    // Revenue by time period
    const revenueByPeriod = await TableOrder.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$totalprice" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalprice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top performing tables
    const topTables = await TableOrder.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $lookup: {
          from: 'tables',
          localField: 'tableId',
          foreignField: '_id',
          as: 'table'
        }
      },
      { $unwind: '$table' },
      {
        $group: {
          _id: '$tableId',
          tableNumber: { $first: '$table.tableNumber' },
          totalRevenue: { $sum: '$totalprice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Top performing foods
    const topFoods = await TableOrder.aggregate([
      { $match: { createdAt: dateRange } },
      { $unwind: '$foods' },
      {
        $lookup: {
          from: 'foods',
          localField: 'foods.foodId',
          foreignField: '_id',
          as: 'foodDetail'
        }
      },
      { $unwind: '$foodDetail' },
      {
        $group: {
          _id: '$foods.foodId',
          name: { $first: '$foodDetail.name' },
          totalQuantity: { $sum: '$foods.quantity' },
          totalRevenue: { $sum: { $multiply: ['$foodDetail.price', '$foods.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: {
          start: dateRange.$gte || startDate,
          end: dateRange.$lte || endDate || now
        },
        revenueByPeriod,
        topTables,
        topFoods
      }
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu',
      error: error.message
    });
  }
};

// Reservation Statistics
const getReservationStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let dateRange, groupBy;

    const now = new Date();
    
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateRange = { $gte: monthAgo };
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateRange = { $gte: yearAgo };
          break;
        default:
          const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { $gte: defaultStart };
      }
    }

    // Reservations by date
    const reservationsByDate = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          count: { $sum: 1 },
          confirmedCount: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Reservations by status
    const reservationsByStatus = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Reservations by time slot (hour of day)
    const reservationsByTimeSlot = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      {
        $group: {
          _id: { $hour: "$startTime" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most booked tables
    const mostBookedTables = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      { $unwind: '$bookedTable' },
      {
        $lookup: {
          from: 'tables',
          localField: 'bookedTable',
          foreignField: '_id',
          as: 'table'
        }
      },
      { $unwind: '$table' },
      {
        $group: {
          _id: '$bookedTable',
          tableNumber: { $first: '$table.tableNumber' },
          capacity: { $first: '$table.capacity' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        reservationsByDate,
        reservationsByStatus,
        reservationsByTimeSlot,
        mostBookedTables
      }
    });
  } catch (error) {
    console.error('Reservation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đặt bàn',
      error: error.message
    });
  }
};

// Staff Performance Statistics
const getStaffStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let dateRange;

    const now = new Date();
    
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateRange = { $gte: monthAgo };
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateRange = { $gte: yearAgo };
          break;
        default:
          const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { $gte: defaultStart };
      }
    }

    // Staff performance based on reservations served
    const staffPerformance = await Reservation.aggregate([
      { 
        $match: { 
          startTime: dateRange,
          servantId: { $ne: null }
        } 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'servantId',
          foreignField: '_id',
          as: 'servant'
        }
      },
      { $unwind: '$servant' },
      {
        $group: {
          _id: '$servantId',
          servantName: { $first: '$servant.fullname' },
          servantEmail: { $first: '$servant.email' },
          totalReservations: { $sum: 1 },
          confirmedReservations: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          completedReservations: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelledReservations: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $eq: ["$totalReservations", 0] },
              0,
              { $multiply: [{ $divide: ["$completedReservations", "$totalReservations"] }, 100] }
            ]
          }
        }
      },
      { $sort: { totalReservations: -1 } }
    ]);

    // Calculate revenue per staff member based on their served reservations
    const staffRevenue = await Reservation.aggregate([
      { 
        $match: { 
          startTime: dateRange,
          servantId: { $ne: null }
        } 
      },
      {
        $lookup: {
          from: 'tableorders',
          localField: '_id',
          foreignField: 'reservationId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'servantId',
          foreignField: '_id',
          as: 'servant'
        }
      },
      { $unwind: '$servant' },
      {
        $group: {
          _id: '$servantId',
          servantName: { $first: '$servant.fullname' },
          totalRevenue: { $sum: { $sum: '$orders.totalprice' } },
          reservationCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          averageRevenuePerReservation: {
            $cond: [
              { $eq: ["$reservationCount", 0] },
              0,
              { $divide: ["$totalRevenue", "$reservationCount"] }
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        staffPerformance,
        staffRevenue
      }
    });
  } catch (error) {
    console.error('Staff stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê nhân viên',
      error: error.message
    });
  }
};

// Customer Analytics
const getCustomerStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    let dateRange;

    const now = new Date();
    
    if (startDate && endDate) {
      dateRange = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateRange = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateRange = { $gte: monthAgo };
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateRange = { $gte: yearAgo };
          break;
        default:
          const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { $gte: defaultStart };
      }
    }

    // Top customers by revenue
    const topCustomers = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      { $unwind: '$customerId' },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $lookup: {
          from: 'tableorders',
          localField: '_id',
          foreignField: 'reservationId',
          as: 'orders'
        }
      },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customer.fullname' },
          customerEmail: { $first: '$customer.email' },
          customerPhone: { $first: '$customer.phone' },
          totalReservations: { $sum: 1 },
          totalRevenue: { $sum: { $sum: '$orders.totalprice' } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 }
    ]);

    // New customers by period
    const newCustomers = await User.aggregate([
      { 
        $match: { 
          role: 'customer',
          createdAt: dateRange
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer retention (customers who made multiple reservations)
    const customerRetention = await Reservation.aggregate([
      { $match: { startTime: dateRange } },
      { $unwind: '$customerId' },
      {
        $group: {
          _id: '$customerId',
          reservationCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$reservationCount',
          customerCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        topCustomers,
        newCustomers,
        customerRetention
      }
    });
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khách hàng',
      error: error.message
    });
  }
};

module.exports = {
    createStaffAccount,
    getAllStaff,
    updateStaffAccount,
    deactivateStaffAccount,
    activateStaffAccount,
    getStaffById,
    resetStaffPassword,
    getDashboardStats,
    getRevenueStats,
    getReservationStats,
    getStaffStats,
    getCustomerStats
} 