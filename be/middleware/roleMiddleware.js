const { StatusCodes } = require('http-status-code');

// Middleware để kiểm tra role của user
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.jwtDecode?.role;
            
            if (!userRole) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Không thể xác định quyền của người dùng'
                });
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    message: 'Bạn không có quyền truy cập tài nguyên này'
                });
            }

            next();
        } catch (err) {
            console.error('Role middleware error:', err);
            return res.status(500).json({
                message: 'Lỗi server nội bộ'
            });
        }
    };
};


const adminOnly = checkRole('admin');
const staffOnly = checkRole('admin', 'chef', 'servant');
const customerOnly = checkRole('customer');
const chefOnly = checkRole('chef');
const servantOnly = checkRole('servant');

module.exports = {
    checkRole,
    adminOnly,
    staffOnly,
    customerOnly,
    chefOnly,
    servantOnly
}; 