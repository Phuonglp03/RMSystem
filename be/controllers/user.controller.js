const bcrypt = require('bcryptjs')
const ms = require('ms')
const { JWTProvider } = require('../middleware/JwtMiddleware')
const User = require('../models/User')
const Customer = require('../models/Customer')
const Admin = require('../models/Admin')
const Chef = require('../models/Chef')
const Servant = require('../models/Servant')

const login = async (req, res) => {
    try {
        const { email: emailOrUsername, password } = req.body

        if (!emailOrUsername || !password) {
            return res.status(400).json({
                message: 'Email/Username và password là bắt buộc'
            })
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername.toLowerCase() }
            ]
        })
        if (!user) {
            return res.status(401).json({
                message: 'Email/Username hoặc password không chính xác'
            })
        }

 
        if (!user.active) {
            return res.status(403).json({
                message: 'Tài khoản đã bị vô hiệu hóa'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Email/Username hoặc password không chính xác'
            })
        }

        const accessToken = JWTProvider.generateToken(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
            process.env.ACCESS_TOKEN_LIFE
        )

        const refreshToken = JWTProvider.generateToken(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
            process.env.REFRESH_TOKEN_LIFE
        )

        res.cookie('accessTokenFromCookie', `Bearer ${accessToken}`, {
            httpOnly: true,
            secure: false, 
            sameSite: 'strict',
            maxAge: ms(process.env.ACCESS_TOKEN_LIFE)
        })

        res.cookie('refreshTokenFromCookie', `Bearer ${refreshToken}`, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: ms(process.env.REFRESH_TOKEN_LIFE)
        })

        const { password: _, ...userWithoutPassword } = user.toObject()

        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: userWithoutPassword,
            accessToken,
            refreshToken
        })

    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi trong quá trình đăng nhập',
            error: err.message
        })
    }
}

const register = async (req, res) => {
    try {
        const { fullname, username, email, phone, password, dateOfBirth, gender, role = 'customer' } = req.body

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email và password là bắt buộc'
            })
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
            role
        })

        const savedUser = await newUser.save()

        // Create role-specific record
        switch (role) {
            case 'customer':
                await new Customer({
                    userId: savedUser._id,
                    points: 0
                }).save()
                break
            case 'admin':
                await new Admin({
                    userId: savedUser._id
                }).save()
                break
            case 'chef':
                await new Chef({
                    userId: savedUser._id,
                    specialties: [],
                    experiencedYear: 0,
                    status: ['available']
                }).save()
                break
            case 'servant':
                await new Servant({
                    userId: savedUser._id,
                    assignedTables: [],
                    status: ['available']
                }).save()
                break
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = savedUser.toObject()

        res.status(200).json({
            message: 'Đăng ký thành công',
            user: userWithoutPassword
        })

    } catch (err) {
        console.error('Register error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi trong quá trình đăng ký',
            error: err.message
        })
    }
}

const logout = async (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('accessTokenFromCookie')
        res.clearCookie('refreshTokenFromCookie')

        res.status(200).json({
            message: 'Đăng xuất thành công'
        })

    } catch (err) {
        console.error('Logout error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi trong quá trình đăng xuất',
            error: err.message
        })
    }
}

const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req?.cookies?.refreshTokenFromCookie

        if (!refreshTokenFromCookie) {
            return res.status(401).json({
                message: 'Refresh token không tồn tại'
            })
        }

        // Verify refresh token
        const refreshTokenDecoded = JWTProvider.verifyToken(
            refreshTokenFromCookie.substring('Bearer '.length),
            process.env.REFRESH_TOKEN_SECRET_SIGNATURE
        )

        // Find user
        const user = await User.findById(refreshTokenDecoded.id)
        if (!user || !user.active) {
            return res.status(401).json({
                message: 'User không tồn tại hoặc đã bị vô hiệu hóa'
            })
        }

        // Generate new access token
        const newAccessToken = JWTProvider.generateToken(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
            process.env.ACCESS_TOKEN_LIFE
        )

        // Set new access token cookie
        res.cookie('accessTokenFromCookie', `Bearer ${newAccessToken}`, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: ms(process.env.ACCESS_TOKEN_LIFE)
        })

        res.status(200).json({
            message: 'Refresh token thành công',
            accessToken: newAccessToken
        })

    } catch (err) {
        console.error('Refresh token error:', err)
        if (err.message.includes('jwt expired')) {
            res.clearCookie('accessTokenFromCookie')
            res.clearCookie('refreshTokenFromCookie')
            return res.status(401).json({
                message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại'
            })
        }

        return res.status(500).json({
            message: 'Đã xảy ra lỗi trong quá trình refresh token',
            error: err.message
        })
    }
}

const getProfile = async (req, res) => {
    try {
        const userId = req.jwtDecode.id
        
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(404).json({
                message: 'User không tồn tại'
            })
        }

        res.status(200).json({
            message: 'Lấy thông tin profile thành công',
            user
        })

    } catch (err) {
        console.error('Get profile error:', err)
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi lấy thông tin profile',
            error: err.message
        })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, active } = req.query;
        
        const filter = {};
        if (role) filter.role = role;
        if (active !== undefined) filter.active = active === 'true';

        const users = await User.find(filter)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.status(200).json({
            message: 'Lấy danh sách users thành công',
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (err) {
        console.error('Get all users error:', err);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi lấy danh sách users',
            error: err.message
        });
    }
};

const getStaffUsers = async (req, res) => {
    try {
        const staffRoles = ['admin', 'chef', 'servant'];
        
        const users = await User.find({ 
            role: { $in: staffRoles },
            active: true 
        }).select('-password');

        res.status(200).json({
            message: 'Lấy danh sách staff thành công',
            users
        });

    } catch (err) {
        console.error('Get staff users error:', err);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi lấy danh sách staff',
            error: err.message
        });
    }
};

module.exports = {
    login,
    register,
    logout,
    refreshToken,
    getProfile,
    getAllUsers,
    getStaffUsers
}