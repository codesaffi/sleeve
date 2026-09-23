import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        // Accept either a custom 'token' header or the standard 'Authorization: Bearer <token>' header
        const headerToken = req.headers.token || req.headers.authorization;
        let token = headerToken;

        if (headerToken && typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
            token = headerToken.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'not authorized login again' });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const expected = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

        if (token_decode !== expected) {
            return res.status(403).json({ success: false, message: 'not authorized login again' });
        }

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

export default adminAuth 