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
                username: user.username,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
            process.env.ACCESS_TOKEN_LIFE
        )

        const refreshToken = JWTProvider.generateToken(
            {
                id: user._id,
                email: user.email,
                username: user.username,
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
                username: user.username,
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

// New API: Get detailed user profile with role-specific data
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.jwtDecode.id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }

        let roleData = null;
        if (user.role === 'customer') {
            roleData = await Customer.findOne({ userId }).populate('coupons');
        }

        const profileData = {
            ...user.toObject(),
            cumulativePoint: roleData?.points || 0,
            couponId: roleData?.coupons || []
        };

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin profile thành công',
            data: profileData
        });

    } catch (err) {
        console.error('Get user profile error:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin profile',
            error: err.message
        });
    }
};

// New API: Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.jwtDecode.id;
        const { fullname, username, phone, dateOfBirth, gender, avatar } = req.body;

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }

        // Check if username is already taken by another user
        if (username && username !== existingUser.username) {
            const userWithSameUsername = await User.findOne({ 
                username: username.toLowerCase(),
                _id: { $ne: userId }
            });
            if (userWithSameUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username đã tồn tại'
                });
            }
        }

        const updateData = {};
        if (fullname !== undefined) updateData.fullname = fullname;
        if (username !== undefined) updateData.username = username.toLowerCase();
        if (phone !== undefined) updateData.phone = phone;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
        if (gender !== undefined) updateData.gender = gender;
        if (avatar !== undefined) updateData.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        // Get role-specific data
        let roleData = null;
        if (updatedUser.role === 'customer') {
            roleData = await Customer.findOne({ userId: updatedUser._id }).populate('coupons');
        }

        const profileData = {
            ...updatedUser.toObject(),
            cumulativePoint: roleData?.points || 0,
            couponId: roleData?.coupons || []
        };

        res.status(200).json({
            success: true,
            message: 'Cập nhật profile thành công',
            data: profileData
        });

    } catch (err) {
        console.error('Update user profile error:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật profile',
            error: err.message
        });
    }
};

// New API: Get loyalty information
const getLoyaltyInfo = async (req, res) => {
    try {
        const userId = req.params.userId || req.jwtDecode.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }

        if (user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ khách hàng mới có thông tin tích điểm'
            });
        }

        const customer = await Customer.findOne({ userId });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Thông tin khách hàng không tồn tại'
            });
        }

        const points = customer.points;
        
        // Define membership levels
        const membershipLevels = [
            { name: 'Đồng', color: '#CD7F32', minPoints: 0, maxPoints: 499 },
            { name: 'Bạc', color: '#C0C0C0', minPoints: 500, maxPoints: 1499 },
            { name: 'Vàng', color: '#FFD700', minPoints: 1500, maxPoints: 2999 },
            { name: 'Bạch Kim', color: '#e5e4e2', minPoints: 3000, maxPoints: Infinity }
        ];

        // Determine current membership level
        const currentLevel = membershipLevels.find(level => 
            points >= level.minPoints && points <= level.maxPoints
        );

        // Determine next level
        const nextLevel = membershipLevels.find(level => 
            level.minPoints > points
        );

        let progressPercentage = 100;
        if (nextLevel) {
            const currentLevelMin = currentLevel.minPoints;
            const nextLevelMin = nextLevel.minPoints;
            const pointsInCurrentLevel = points - currentLevelMin;
            const totalPointsNeeded = nextLevelMin - currentLevelMin;
            progressPercentage = Math.round((pointsInCurrentLevel / totalPointsNeeded) * 100);
        }

        const loyaltyData = {
            points,
            membershipLevel: {
                name: currentLevel.name,
                color: currentLevel.color
            },
            nextLevel: nextLevel ? {
                name: nextLevel.name,
                points: nextLevel.minPoints,
                pointsToNext: nextLevel.minPoints - points
            } : null,
            progressPercentage
        };

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin tích điểm thành công',
            data: loyaltyData
        });

    } catch (err) {
        console.error('Get loyalty info error:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin tích điểm',
            error: err.message
        });
    }
};

// New API: Get user coupons
const getUserCoupons = async (req, res) => {
    try {
        const userId = req.params.userId || req.jwtDecode.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }

        if (user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ khách hàng mới có mã giảm giá'
            });
        }

        const customer = await Customer.findOne({ userId }).populate('coupons');
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Thông tin khách hàng không tồn tại'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách mã giảm giá thành công',
            data: customer.coupons || []
        });

    } catch (err) {
        console.error('Get user coupons error:', err);
        return res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách mã giảm giá',
            error: err.message
        });
    }
};

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
    getUserProfile,
    updateUserProfile,
    getLoyaltyInfo,
    getUserCoupons,
    getAllUsers,
    getStaffUsers
}