import JWT from 'jsonwebtoken';

const generateToken = (userInfo, secretSignature, tokenLife) => {
    try {
        return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
    } catch (err) {
        throw new Error('generateToken err: ', err)
    }
}
const verifyToken = (token, secretSignature,) => {
    try {
        return JWT.verify(token, secretSignature)
    } catch (err) {
        throw new Error('generateToken err: ', err)
    }
}

export const JWTProvider = {
    generateToken,
    verifyToken
}