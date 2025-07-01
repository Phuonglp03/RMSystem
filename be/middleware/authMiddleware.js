const StatusCodes = require('http-status-codes');
const { JWTProvider } = require('./JwtMiddleware');

const authMiddleware = async (req, res, next) => {
    // Try to get token from cookie first, then from Authorization header
    let accessToken = req?.cookies?.accessTokenFromCookie;

    // If no token in cookie, check Authorization header
    if (!accessToken) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader;
        }
    }

    if (!accessToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized, access token not found'
        });
    }

    try {
        // Remove 'Bearer ' prefix if present
        const tokenValue = accessToken.startsWith('Bearer ')
            ? accessToken.substring('Bearer '.length)
            : accessToken;

        // Verify and decode the token
        const accessTokenDecoded = JWTProvider.verifyToken(
            tokenValue,
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE
        );

        // Save decoded info to request object
        req.jwtDecode = accessTokenDecoded;

        // Continue to next middleware
        next();
    } catch (err) {
        console.log('Error from authMiddleware: ', err);

        // Case 1: accessToken expired
        if (err?.message?.includes('jwt expired')) {
            return res.status(StatusCodes.GONE).json({
                message: 'Access Token expired! Need to refresh token.'
            });
        }

        // Case 2: accessToken invalid
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized! Please login again.'
        });
    }
};

module.exports = { authMiddleware };