import { StatusCodes } from 'http-status-codes';
import ms from 'ms';
import { JWTProvider } from '../providers/JwtProvider.js'; 
import User from '../models/User.js'; 
import Customer from '../models/Customer.js'; 
import bcrypt from 'bcryptjs'; 

const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE || '1h'; 
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE || '7d'; 
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secfafaret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'sech141ret';

export const register = async (req, res) => {
    try {
        const { fullname, username, email, phone, password, dateOfBirth, gender, avatar } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username, email, and password are required.' });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(StatusCodes.CONFLICT).json({ message: 'Username đã tồn tại.' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(StatusCodes.CONFLICT).json({ message: 'Email đã tồn tại.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            dateOfBirth,
            gender,
            avatar,
        });

        const savedUser = await newUser.save();

        const newCustomer = new Customer({
            userId: savedUser._id,
        });
        await newCustomer.save();

        const accessToken = JWTProvider.generateToken(
            { userId: savedUser._id, role: savedUser.role, username: savedUser.username },
            ACCESS_TOKEN_SECRET,
            ACCESS_TOKEN_LIFE
        );

        const refreshToken = JWTProvider.generateToken(
            { userId: savedUser._id, role: savedUser.role, username: savedUser.username }, 
            REFRESH_TOKEN_SECRET,
            REFRESH_TOKEN_LIFE
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict', 
            maxAge: ms(REFRESH_TOKEN_LIFE),
        });
        

        res.status(StatusCodes.CREATED).json({
            message: 'Đăng ký thành công!',
            accessToken,
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
            },
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message || 'Lỗi máy chủ nội bộ.' });
    }
};



export const login = async (req, res) => {
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
