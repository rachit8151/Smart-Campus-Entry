// ============================================
// ✅ JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token and attach user info
const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify JWT and decode payload
    const data = jwt.verify(token, JWT_SECRET);

    // Attach decoded user info to request
    req.user = data.user; // { id, roleId, regId }

    next(); // proceed to next middleware or route
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = fetchUser;
