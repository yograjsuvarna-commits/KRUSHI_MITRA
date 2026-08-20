const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'starq_cricket_talent_assessment_jwt_super_secret_2026';

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.full_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Missing token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` });
        }
        next();
    };
}

module.exports = {
    JWT_SECRET,
    generateToken,
    requireAuth,
    requireRole
};
