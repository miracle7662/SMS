import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import SocietyRepository from '../repositories/society.repository.js';
import UserSocietyRepository from '../repositories/userSociety.repository.js';

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile/Email and password are required'
      });
    }

    const user = await UserRepository.findByMobileOrEmail(login);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isSuperAdmin = await UserRepository.isSuperAdmin(user.id);
    const societies = await UserRepository.getUserSocieties(user.id);

    // ✅ Use JWT_ACCESS_SECRET from .env
    const access_token = jwt.sign(
      { 
        id: user.id,
        isSuperAdmin: isSuperAdmin
      },
      process.env.JWT_ACCESS_SECRET,  // ✅ Changed from JWT_SECRET
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    const refresh_token = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,  // ✅ Changed from JWT_SECRET
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          isSuperAdmin: isSuperAdmin
        },
        societies: societies,
        requires_society_selection: isSuperAdmin || societies.length > 1
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ✅ GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await UserRepository.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isSuperAdmin = await UserRepository.isSuperAdmin(user.id);
    const societies = await UserRepository.getUserSocieties(user.id);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        isSuperAdmin: isSuperAdmin,
        societies: societies
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// ✅ GET USER SOCIETIES
export const getSocieties = async (req, res) => {
  try {
    const isSuperAdmin = await UserRepository.isSuperAdmin(req.user.id);
    
    let societies;
    if (isSuperAdmin) {
      societies = await SocietyRepository.getAllForSuperAdmin();
    } else {
      societies = await UserRepository.getUserSocieties(req.user.id);
    }
    
    return res.status(200).json({
      success: true,
      data: societies
    });
  } catch (error) {
    console.error('Get societies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching societies'
    });
  }
};

// ✅ SELECT SOCIETY
export const selectSociety = async (req, res) => {
  try {
    const { society_id } = req.body;
    
    if (!society_id) {
      return res.status(400).json({
        success: false,
        message: 'Society ID required'
      });
    }

    const society = await SocietyRepository.getById(society_id);
    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    const isSuperAdmin = await UserRepository.isSuperAdmin(req.user.id);
    const hasAccess = isSuperAdmin || await UserSocietyRepository.hasAccess(req.user.id, society_id);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this society'
      });
    }

    // ✅ Use JWT_ACCESS_SECRET from .env
    const access_token = jwt.sign(
      { 
        id: req.user.id, 
        societyId: parseInt(society_id),
        isSuperAdmin: isSuperAdmin
      },
      process.env.JWT_ACCESS_SECRET,  // ✅ Changed from JWT_SECRET
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Society selected successfully',
      data: {
        society_id: parseInt(society_id),
        society_name: society.society_name,
        society_code: society.society_code,
        access_token
      }
    });
  } catch (error) {
    console.error('Select society error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error selecting society'
    });
  }
};

// ✅ REFRESH TOKEN
export const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // ✅ Use JWT_REFRESH_SECRET from .env
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await UserRepository.getById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const isSuperAdmin = await UserRepository.isSuperAdmin(user.id);
    
    // ✅ Use JWT_ACCESS_SECRET from .env
    const access_token = jwt.sign(
      { 
        id: user.id,
        isSuperAdmin: isSuperAdmin
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    return res.status(200).json({
      success: true,
      data: { access_token }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};