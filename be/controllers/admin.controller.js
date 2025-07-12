const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Customer = require('../models/Customer')
const Admin = require('../models/Admin')
const Chef = require('../models/Chef')
const Servant = require('../models/Servant')

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

module.exports = {
    createStaffAccount,
    getAllStaff,
    updateStaffAccount,
    deactivateStaffAccount,
    activateStaffAccount,
    getStaffById,
    resetStaffPassword
} 