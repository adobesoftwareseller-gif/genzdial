const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, SECRET, { expiresIn });
}

function authRequired(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        req.admin = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = { signToken, authRequired };
