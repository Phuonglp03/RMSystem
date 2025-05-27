import { StatusCodes } from 'http-status-code'
import ms from 'ms'
import { JWTProvider } from '../providers/JwtProvider.js'

export const login = async (req, res) => {
    try {

    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
    }
}

export const register = async (req, res) => {
    try {

    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
    }
}

export const logout = async (req, res) => {
    try {

    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
    }
}

export const refreshToken = async