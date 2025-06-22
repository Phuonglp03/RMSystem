import { StatusCodes } from 'http-status-code'
import { JWTProvider } from '../providers/JwtProvider'

const authMiddleware = async (req, res, next) => {
    const accessTokenFromCookie = req?.cookies?.accessTokenFromCookie

    if (!accessTokenFromCookie) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized, access token not found'
        })
        return
    }

    try {
        //B1: thuc hien giai ma token xem no co hop le hay khong
        const accessTokenDecoded = JWTProvider.verifyToken(
            accessTokenFromCookie.substring('Bearer '.length),
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE // Loai bo Bearer
        )
        //B2: Neu token hop le, luu thong tin giai ma duoc vao req.jwtDecode
        req.jwtDecode = accessTokenDecoded

        //B3: Cho phep request di tiep den tang xu ly tiep theo
        next()
    } catch (err) {
        console.log('Error from authMiddleware: ', error)
        //Case 1: accessToken het han:
        if (err?.message?.includes('jwt expired')) {
            res.status(StatusCodes.GONE).json({
                message: 'Access Token expired! Need to refresh token.'
            })
        }

        //Case 2: accessToken khong hop le
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Unauthorized! Please login again.'
        })
    }
}
module.exports = { authMiddleware }