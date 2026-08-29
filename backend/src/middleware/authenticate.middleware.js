import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';  // ✅ हे बरोबर आहे का?

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const pool = getPool();  // ✅ हे काम करेल
    const [users] = await pool.execute(
      `SELECT id, name, mobile, email, profile_image, status 
       FROM users 
       WHERE id = ? AND deleted_at IS NULL AND status = 'ACTIVE'`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    
    const [roles] = await pool.execute(`
      SELECT r.role_code 
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND r.status = 'ACTIVE'
    `, [user.id]);

    const isSuperAdmin = roles.some(r => r.role_code === 'SUPER_ADMIN');

    req.user = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: isSuperAdmin ? 'super_admin' : 'user',
      isSuperAdmin: isSuperAdmin,
      societyId: decoded.societyId || null
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};