import pool from '../config/database.js';

const Report = {
  /**
   * Daily revenue + total summary for a date range.
   * Only completed tasks are counted.
   */
  async getSalesSummary({ from, to }) {
    const [daily] = await pool.query(
      `SELECT
         DATE(created_at)            AS date,
         COUNT(*)                    AS taskCount,
         COALESCE(SUM(price), 0)     AS revenue,
         COALESCE(AVG(price), 0)     AS avgValue
       FROM tasks
       WHERE status = 'completed'
         AND is_deleted = 0
         AND DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [from, to]
    );

    const [totals] = await pool.query(
      `SELECT
         COUNT(*)                AS totalTasks,
         COALESCE(SUM(price), 0) AS totalRevenue,
         COALESCE(AVG(price), 0) AS avgTaskValue
       FROM tasks
       WHERE status = 'completed'
         AND is_deleted = 0
         AND DATE(created_at) BETWEEN ? AND ?`,
      [from, to]
    );

    return { daily, totals: totals[0] };
  },

  /**
   * Per-employee: tasks completed, revenue generated, commission earned.
   */
  async getEmployeeReport({ from, to }) {
    const [rows] = await pool.query(
      `SELECT
         u.id                                  AS employeeId,
         u.firstName,
         u.lastName,
         COUNT(t.id)                           AS tasksCompleted,
         COALESCE(SUM(t.price), 0)             AS totalRevenue,
         COALESCE(SUM(c.commission_amount), 0) AS totalCommission
       FROM users u
       LEFT JOIN tasks t
         ON t.employee_id = u.id
         AND t.status = 'completed'
         AND t.is_deleted = 0
         AND DATE(t.created_at) BETWEEN ? AND ?
       LEFT JOIN commissions c ON c.task_id = t.id
       WHERE u.role = 'employee' AND u.isActive = 1
       GROUP BY u.id, u.firstName, u.lastName
       ORDER BY totalRevenue DESC`,
      [from, to]
    );
    return rows;
  },

  /**
   * Per-service: task count, total revenue, avg price — completed tasks only.
   * Sorted by task count (popularity).
   */
  async getServiceReport({ from, to }) {
    const [rows] = await pool.query(
      `SELECT
         s.id                              AS serviceId,
         s.name                            AS serviceName,
         sc.name                           AS categoryName,
         COUNT(t.id)                       AS taskCount,
         COALESCE(SUM(t.price), 0)         AS totalRevenue,
         COALESCE(AVG(t.price), 0)         AS avgPrice
       FROM services s
       LEFT JOIN service_categories sc ON sc.id = s.category_id
       LEFT JOIN tasks t
         ON t.service_id = s.id
         AND t.status = 'completed'
         AND t.is_deleted = 0
         AND DATE(t.created_at) BETWEEN ? AND ?
       WHERE s.is_deleted = 0
       GROUP BY s.id, s.name, sc.name
       ORDER BY taskCount DESC
       LIMIT 20`,
      [from, to]
    );
    return rows;
  },
};

export default Report;
