import jwt from 'jsonwebtoken'
const { verify } = jwt
const authorizationRequired = "Authorization required"
const invalidCredentials = "Invalid credentials"

const auth = (req,res,next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Authorization token is required' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decoded.user
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export { auth }