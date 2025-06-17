const { StatusCodes } = require('http-status-code')
const ms = require('ms')
const { JWTProvider } = require('../providers/JwtProvider')

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