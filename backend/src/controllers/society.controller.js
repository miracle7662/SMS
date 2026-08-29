import {
  getSocieties as getAuthSocieties,
  selectSociety as selectAuthSociety,
} from './auth.controller.js';

export const getSocieties = getAuthSocieties;
export const selectSociety = selectAuthSociety;

export const createSociety = async (req, res) => {
  try {
    const { society_name, society_code, address, city, state, pincode, email, mobile } = req.body;

    // Check if super admin
    const isAdmin = await UserRepository.isSuperAdmin(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can create societies'
      });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO societies 
       (society_name, society_code, address, city, state, pincode, email, mobile, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [society_name, society_code, address, city, state, pincode, email, mobile, req.user.id]
    );

    return res.status(201).json({
      success: true,
      message: 'Society created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating society:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating society'
    });
  }
};