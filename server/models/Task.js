import pool from '../config/database.js';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const Task = {
  isLocked(createdAt) {
    return Date.now() - new Date(createdAt).getTime() > TWENTY_FOUR_HOURS;
  },

  // Lock old tasks (call on list reads so lock flag stays current)
  async lockOldTasks() {
    await pool.query(
      `UPDATE tasks
       SET is_locked = 1
       WHERE is_locked = 0
         AND TIMESTAMPDIFF(SECOND, created_at, NOW()) > 86400`,
    );
  },

  async findAll(filters = {}) {
    await this.lockOldTasks();

    const conditions = ['t.is_deleted = 0'];
    const params = [];

    if (filters.employeeId) {
      conditions.push('t.employee_id = ?');
      params.push(filters.employeeId);
    }
    if (filters.status) {
      conditions.push('t.status = ?');
      params.push(filters.status);
    }
    if (filters.serviceId) {
      conditions.push('t.service_id = ?');
      params.push(filters.serviceId);
    }
    if (filters.date) {
      conditions.push('DATE(t.created_at) = ?');
      params.push(filters.date);
    } else if (!filters.employeeId && !filters.allDates) {
      // Default: today only (employees) or last 30 days (admin)
      if (filters.isAdmin) {
        conditions.push('t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      } else {
        conditions.push('DATE(t.created_at) = CURDATE()');
      }
    }

    const where = conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT
         t.*,
         u.name      AS employeeName,
         s.name      AS serviceName,
         s.duration  AS serviceDuration,
         c.name      AS customerName,
         c.phone     AS customerPhone
       FROM tasks t
       JOIN users u    ON u.id = t.employee_id
       JOIN services s ON s.id = t.service_id
       LEFT JOIN customers c ON c.id = t.customer_id
       WHERE ${where}
       ORDER BY t.created_at DESC`,
      params,
    );
    // Normalise employee name split for frontend compatibility
    return rows.map((r) => ({
      ...r,
      employeeFirstName: (r.employeeName || '').split(' ')[0],
      employeeLastName: (r.employeeName || '').split(' ').slice(1).join(' '),
    }));
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT
         t.*,
         u.name      AS employeeName,
         s.name      AS serviceName,
         c.name      AS customerName,
         c.phone     AS customerPhone
       FROM tasks t
       JOIN users u    ON u.id = t.employee_id
       JOIN services s ON s.id = t.service_id
       LEFT JOIN customers c ON c.id = t.customer_id
       WHERE t.id = ? AND t.is_deleted = 0`,
      [id],
    );
    const r = rows[0];
    if (!r) return null;
    return {
      ...r,
      employeeFirstName: (r.employeeName || '').split(' ')[0],
      employeeLastName: (r.employeeName || '').split(' ').slice(1).join(' '),
    };
  },

  async create({
    employeeId,
    customerId,
    serviceId,
    startTime,
    endTime,
    price,
    discountType,
    discountValue,
    notes,
    status,
  }) {
    const [result] = await pool.query(
      `INSERT INTO tasks
         (employee_id, customer_id, service_id, start_time, end_time, price, discount_type, discount_value, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        customerId || null,
        serviceId,
        startTime,
        endTime || null,
        price,
        discountType || null,
        discountValue || null,
        notes || null,
        status || 'pending',
        employeeId,
      ],
    );
    return this.findById(result.insertId);
  },

  async update(id, { price, discountType, discountValue, notes, endTime }) {
    const task = await this.findById(id);
    if (!task) return null;
    if (task.is_locked) throw new Error('LOCKED');

    await pool.query(
      `UPDATE tasks
       SET price = ?, discount_type = ?, discount_value = ?, notes = ?, end_time = ?
       WHERE id = ?`,
      [price, discountType || null, discountValue || null, notes || null, endTime || null, id],
    );
    return this.findById(id);
  },

  async updateStatus(id, status) {
    const task = await this.findById(id);
    if (!task) return null;
    if (task.is_locked) throw new Error('LOCKED');

    // Auto-set end_time when completing
    const endTime = status === 'completed' ? new Date() : task.end_time;
    await pool.query('UPDATE tasks SET status = ?, end_time = ? WHERE id = ?', [
      status,
      endTime,
      id,
    ]);
    return this.findById(id);
  },

  // Today's summary for the logged-in employee (used by dashboard)
  async getSummary(userId) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS todayCount,
         COALESCE(SUM(price), 0) AS todayRevenue,
         SUM(status = 'completed') AS completedCount
       FROM tasks
       WHERE employee_id = ?
         AND DATE(created_at) = CURDATE()
         AND is_deleted = 0`,
      [userId],
    );
    return rows[0];
  },
};

export default Task;
