import { getPool } from '../config/database.js';

export const createMember = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      flat_id,
      member_type,
      ownership_percentage,
      occupancy_start,
      occupancy_end,
      agreement_status,
      police_noc_status,
      is_primary,
      father_husband_name,
      date_of_birth,
      gender,
      alternate_mobile,
      pan_number,
      aadhaar_number,
      occupation,
      profile_photo,
      address_line,
      area_locality,
      city,
      state,
      country,
      pin_code
    } = req.body;

    const pool = getPool();
    const societyId = req.user?.society_id || 7;
    const createdBy = req.user?.id || 1;

    // ===== Check if flat is already assigned to ACTIVE member =====
    const checkQuery = `
      SELECT id FROM flat_members 
      WHERE flat_id = ? AND status = 'ACTIVE'
    `;
    const [existing] = await pool.execute(checkQuery, [flat_id]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This flat is already assigned to another active member'
      });
    }

    const formatDate = (date) => {
      if (!date) return null;
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      } catch {
        return null;
      }
    };

    const formattedDOB = formatDate(date_of_birth);
    const formattedStart = formatDate(occupancy_start);
    const formattedEnd = formatDate(occupancy_end);

    const memberCode = `MEM${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const memberQuery = `
      INSERT INTO members (
        society_id, name, mobile, email, status, created_by, member_code
      ) VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)
    `;

    const [memberResult] = await pool.execute(memberQuery, [
      societyId,
      name,
      mobile,
      email || null,
      createdBy,
      memberCode
    ]);

    const memberId = memberResult.insertId;

    const flatMemberQuery = `
      INSERT INTO flat_members (
        society_id, flat_id, member_id, member_type,
        ownership_percentage, occupancy_start, occupancy_end,
        agreement_status, police_noc_status, is_primary,
        father_husband_name, date_of_birth, gender,
        alternate_mobile, pan_number, aadhaar_number,
        occupation, profile_photo,
        address_line, area_locality, city, state, country, pin_code,
        created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `;

    const values = [
      societyId,
      Number(flat_id),
      memberId,
      member_type,
      ownership_percentage || null,
      formattedStart,
      formattedEnd,
      agreement_status || 'NOT_REQUIRED',
      police_noc_status || 'NOT_REQUIRED',
      is_primary || false,
      father_husband_name || null,
      formattedDOB,
      gender || null,
      alternate_mobile || null,
      pan_number ? pan_number.toUpperCase() : null,
      aadhaar_number || null,
      occupation || null,
      profile_photo || null,
      address_line || null,
      area_locality || null,
      city || null,
      state || null,
      country || 'India',
      pin_code || null,
      createdBy
    ];

    const [result] = await pool.execute(flatMemberQuery, values);

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: {
        memberId: memberId,
        flatMemberId: result.insertId,
        name: name,
        member_type: member_type,
        member_code: memberCode
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
};

export const listMembers = async (req, res) => {
  try {
    const pool = getPool();
    const societyId = req.user?.society_id || 7;
    const { type } = req.query;

    let query = `
      SELECT 
        fm.*,
        m.name,
        m.mobile,
        m.email,
        m.member_code,
        f.flat_no
      FROM flat_members fm
      LEFT JOIN members m ON fm.member_id = m.id
      LEFT JOIN flats f ON fm.flat_id = f.id
      WHERE fm.society_id = ? AND fm.status = 'ACTIVE'
    `;

    const params = [societyId];

    if (type) {
      query += ` AND fm.member_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY fm.id DESC`;

    const [rows] = await pool.execute(query, params);

    const formattedRows = rows.map(row => ({
      ...row,
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth).toISOString().split('T')[0] : null,
      occupancy_start: row.occupancy_start ? new Date(row.occupancy_start).toISOString().split('T')[0] : null,
      occupancy_end: row.occupancy_end ? new Date(row.occupancy_end).toISOString().split('T')[0] : null
    }));

    res.status(200).json({
      success: true,
      data: formattedRows
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      flat_id,
      member_type,
      ownership_percentage,
      occupancy_start,
      occupancy_end,
      agreement_status,
      police_noc_status,
      is_primary,
      father_husband_name,
      date_of_birth,
      gender,
      alternate_mobile,
      pan_number,
      aadhaar_number,
      occupation,
      profile_photo,
      address_line,
      area_locality,
      city,
      state,
      country,
      pin_code
    } = req.body;

    console.log("📝 Updating Member:", { id, name, date_of_birth, occupancy_start, occupancy_end });

    const formatDate = (date) => {
      if (!date) return null;
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date;
      }
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
      } catch {
        return null;
      }
    };

    const formattedDOB = formatDate(date_of_birth);
    const formattedStart = formatDate(occupancy_start);
    const formattedEnd = formatDate(occupancy_end);

    const pool = getPool();
    const updatedBy = req.user?.id || 1;

    const memberQuery = `
      UPDATE members 
      SET name = ?, mobile = ?, email = ?, updated_by = ?, updated_at = NOW()
      WHERE id = (SELECT member_id FROM flat_members WHERE id = ?)
    `;

    await pool.execute(memberQuery, [
      name,
      mobile,
      email || null,
      updatedBy,
      id
    ]);

    const flatMemberQuery = `
      UPDATE flat_members 
      SET 
        flat_id = ?,
        member_type = ?,
        ownership_percentage = ?,
        occupancy_start = ?,
        occupancy_end = ?,
        agreement_status = ?,
        police_noc_status = ?,
        is_primary = ?,
        father_husband_name = ?,
        date_of_birth = ?,
        gender = ?,
        alternate_mobile = ?,
        pan_number = ?,
        aadhaar_number = ?,
        occupation = ?,
        profile_photo = ?,
        address_line = ?,
        area_locality = ?,
        city = ?,
        state = ?,
        country = ?,
        pin_code = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      Number(flat_id),
      member_type,
      ownership_percentage || null,
      formattedStart,
      formattedEnd,
      agreement_status || 'NOT_REQUIRED',
      police_noc_status || 'NOT_REQUIRED',
      is_primary || false,
      father_husband_name || null,
      formattedDOB,
      gender || null,
      alternate_mobile || null,
      pan_number ? pan_number.toUpperCase() : null,
      aadhaar_number || null,
      occupation || null,
      profile_photo || null,
      address_line || null,
      area_locality || null,
      city || null,
      state || null,
      country || 'India',
      pin_code || null,
      updatedBy,
      id
    ];

    const [result] = await pool.execute(flatMemberQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: {
        id: id,
        name: name,
        member_type: member_type
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message
    });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    // ===== Check if member exists =====
    const [memberRows] = await pool.execute(
      `SELECT member_id FROM flat_members WHERE id = ? AND status = 'ACTIVE'`,
      [id]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or already inactive'
      });
    }

    const memberId = memberRows[0].member_id;

    // ===== Soft Delete from flat_members =====
    await pool.execute(
      `UPDATE flat_members SET status = 'INACTIVE', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    // ===== Soft Delete from members =====
    await pool.execute(
      `UPDATE members SET status = 'INACTIVE' WHERE id = ?`,
      [memberId]
    );

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
};