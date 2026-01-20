const db = require('../config/database');
const bcrypt = require('bcryptjs');

class StaffService {
  // Get all staff members for a restaurant
  async getStaff(restaurantId, filters = {}) {
    let query = `
      SELECT 
        s.id,
        s.staff_number,
        s.role,
        s.shift,
        s.status,
        s.salary,
        s.join_date,
        s.created_at,
        s.updated_at,
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        -- Attendance stats for current month
        COALESCE(att_stats.present_days, 0) as present_days,
        COALESCE(att_stats.absent_days, 0) as absent_days,
        COALESCE(att_stats.leave_days, 0) as leave_days,
        -- Performance stats
        COALESCE(perf_stats.orders_served, 0) as orders_served,
        COALESCE(perf_stats.avg_rating, 0) as avg_rating
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN (
        SELECT 
          staff_id,
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
          COUNT(CASE WHEN status IN ('leave', 'half-day') THEN 1 END) as leave_days
        FROM attendance 
        WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY staff_id
      ) att_stats ON s.id = att_stats.staff_id
      LEFT JOIN (
        SELECT 
          o.waiter_id as staff_id,
          COUNT(o.id) as orders_served,
          AVG(r.rating) as avg_rating
        FROM orders o
        LEFT JOIN reviews r ON o.id = r.order_id
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY o.waiter_id
      ) perf_stats ON s.id = perf_stats.staff_id
      WHERE s.restaurant_id = $1
    `;
    
    const params = [restaurantId];
    let paramCount = 2;
    
    // Apply filters
    if (filters.role) {
      query += ` AND s.role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }
    
    if (filters.status) {
      query += ` AND s.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }
    
    if (filters.shift) {
      query += ` AND s.shift = $${paramCount}`;
      params.push(filters.shift);
      paramCount++;
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Get staff member by ID
  async getStaffById(staffId) {
    const result = await db.query(`
      SELECT 
        s.*,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        r.name as restaurant_name
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN restaurants r ON s.restaurant_id = r.id
      WHERE s.id = $1
    `, [staffId]);
    
    if (result.rows.length === 0) {
      const error = new Error('Staff member not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }

  // Add new staff member
  async addStaff(staffData) {
    const {
      restaurantId,
      name,
      email,
      phone,
      role,
      shift,
      salary,
      password = 'staff123' // Default password
    } = staffData;

    // Start transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if user already exists
      let userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      let userId;
      
      if (userResult.rows.length === 0) {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        userResult = await client.query(`
          INSERT INTO users (email, password_hash, full_name, phone, role)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [email, passwordHash, name, phone, role]);
        
        userId = userResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }
      
      // Generate staff number
      const staffNumberResult = await client.query(
        'SELECT COUNT(*) + 1 as next_number FROM staff WHERE restaurant_id = $1',
        [restaurantId]
      );
      const staffNumber = `S${String(staffNumberResult.rows[0].next_number).padStart(3, '0')}`;
      
      // Create staff record
      const staffResult = await client.query(`
        INSERT INTO staff (
          user_id, restaurant_id, staff_number, role, shift, 
          status, salary, join_date
        )
        VALUES ($1, $2, $3, $4, $5, 'active', $6, CURRENT_DATE)
        RETURNING *
      `, [userId, restaurantId, staffNumber, role, shift, salary]);
      
      await client.query('COMMIT');
      
      // Get complete staff data
      const completeStaff = await this.getStaffById(staffResult.rows[0].id);
      return completeStaff;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update staff member
  async updateStaff(staffId, updateData) {
    const allowedFields = ['role', 'shift', 'status', 'salary'];
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(staffId);
    
    const query = `
      UPDATE staff 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      const error = new Error('Staff member not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Update user data if provided
    if (updateData.name || updateData.email || updateData.phone) {
      const userFields = [];
      const userValues = [];
      let userParamCount = 1;
      
      if (updateData.name) {
        userFields.push(`full_name = $${userParamCount}`);
        userValues.push(updateData.name);
        userParamCount++;
      }
      
      if (updateData.email) {
        userFields.push(`email = $${userParamCount}`);
        userValues.push(updateData.email);
        userParamCount++;
      }
      
      if (updateData.phone) {
        userFields.push(`phone = $${userParamCount}`);
        userValues.push(updateData.phone);
        userParamCount++;
      }
      
      if (userFields.length > 0) {
        userFields.push('updated_at = CURRENT_TIMESTAMP');
        userValues.push(result.rows[0].user_id);
        
        await db.query(`
          UPDATE users 
          SET ${userFields.join(', ')} 
          WHERE id = $${userParamCount}
        `, userValues);
      }
    }
    
    return await this.getStaffById(staffId);
  }

  // Delete staff member
  async deleteStaff(staffId) {
    const result = await db.query(
      'DELETE FROM staff WHERE id = $1 RETURNING *',
      [staffId]
    );
    
    if (result.rows.length === 0) {
      const error = new Error('Staff member not found');
      error.statusCode = 404;
      throw error;
    }
    
    return result.rows[0];
  }

  // Get attendance records
  async getAttendance(staffId, startDate, endDate) {
    let query = `
      SELECT * FROM attendance 
      WHERE staff_id = $1
    `;
    const params = [staffId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  // Mark attendance
  async markAttendance(staffId, attendanceData) {
    const { status, clockIn, clockOut, leaveType, notes } = attendanceData;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if attendance already exists for today
    const existingResult = await db.query(
      'SELECT id FROM attendance WHERE staff_id = $1 AND date = $2',
      [staffId, today]
    );
    
    let result;
    
    if (existingResult.rows.length === 0) {
      // Insert new attendance
      result = await db.query(`
        INSERT INTO attendance (
          staff_id, date, status, clock_in, clock_out, leave_type, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [staffId, today, status, clockIn, clockOut, leaveType, notes]);
    } else {
      // Update existing attendance
      result = await db.query(`
        UPDATE attendance 
        SET status = $1, clock_in = $2, clock_out = $3, 
            leave_type = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
        WHERE staff_id = $6 AND date = $7
        RETURNING *
      `, [status, clockIn, clockOut, leaveType, notes, staffId, today]);
    }
    
    return result.rows[0];
  }

  // Clock in/out
  async clockInOut(staffId, action) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Check if attendance exists for today
    const existingResult = await db.query(
      'SELECT * FROM attendance WHERE staff_id = $1 AND date = $2',
      [staffId, today]
    );
    
    let result;
    
    if (existingResult.rows.length === 0 && action === 'clock-in') {
      // Create new attendance record with clock in
      result = await db.query(`
        INSERT INTO attendance (staff_id, date, status, clock_in)
        VALUES ($1, $2, 'present', $3)
        RETURNING *
      `, [staffId, today, now]);
    } else if (existingResult.rows.length > 0) {
      const attendance = existingResult.rows[0];
      
      if (action === 'clock-in' && !attendance.clock_in) {
        result = await db.query(`
          UPDATE attendance 
          SET clock_in = $1, status = 'present', updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `, [now, attendance.id]);
      } else if (action === 'clock-out' && attendance.clock_in && !attendance.clock_out) {
        result = await db.query(`
          UPDATE attendance 
          SET clock_out = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `, [now, attendance.id]);
      } else {
        throw new Error(`Cannot ${action}: Invalid state`);
      }
    } else {
      throw new Error(`Cannot ${action}: No attendance record found`);
    }
    
    return result.rows[0];
  }

  // Get staff performance
  async getPerformance(staffId, period = 'month') {
    let dateFilter = '';
    
    switch (period) {
      case 'week':
        dateFilter = "AND o.created_at >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'year':
        dateFilter = "AND o.created_at >= DATE_TRUNC('year', CURRENT_DATE)";
        break;
      default:
        dateFilter = "AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)";
    }
    
    const result = await db.query(`
      SELECT 
        COUNT(o.id) as total_orders,
        AVG(r.rating) as avg_rating,
        SUM(o.total) as total_sales,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders o
      LEFT JOIN reviews r ON o.id = r.order_id
      WHERE o.waiter_id = $1 ${dateFilter}
    `, [staffId]);
    
    return result.rows[0];
  }

  // Get restaurant staff statistics
  async getStats(restaurantId) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_staff,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff,
        COUNT(CASE WHEN status = 'on-leave' THEN 1 END) as on_leave_staff,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_staff,
        AVG(salary) as avg_salary,
        COUNT(CASE WHEN role = 'waiter' THEN 1 END) as waiters,
        COUNT(CASE WHEN role = 'chef' THEN 1 END) as chefs,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
        COUNT(CASE WHEN role = 'cleaner' THEN 1 END) as cleaners,
        COUNT(CASE WHEN role = 'cashier' THEN 1 END) as cashiers
      FROM staff 
      WHERE restaurant_id = $1
    `, [restaurantId]);
    
    return result.rows[0];
  }

  // Get payroll data
  async getPayroll(restaurantId, month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const result = await db.query(`
      SELECT 
        s.id,
        s.staff_number,
        s.role,
        s.salary,
        u.full_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN a.status IN ('leave', 'half-day') THEN 1 END) as leave_days,
        -- Calculate working hours
        SUM(
          CASE 
            WHEN a.clock_in IS NOT NULL AND a.clock_out IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (a.clock_out - a.clock_in)) / 3600
            ELSE 0 
          END
        ) as total_hours
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON s.id = a.staff_id 
        AND a.date >= $2 AND a.date <= $3
      WHERE s.restaurant_id = $1
      GROUP BY s.id, s.staff_number, s.role, s.salary, u.full_name
      ORDER BY s.staff_number
    `, [restaurantId, startDate, endDate]);
    
    return result.rows;
  }
}

module.exports = new StaffService();