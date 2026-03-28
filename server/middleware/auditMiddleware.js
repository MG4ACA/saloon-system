import pool from '../config/database.js';

/**
 * Audit log middleware — records every mutating request (POST/PUT/PATCH/DELETE)
 * to the audit_logs table. Fire-and-forget: never blocks or fails the response.
 *
 * Usage: mount after authenticateToken so req.user is populated.
 *   app.use('/api/services', authenticateToken, auditLog('services'), serviceRoutes);
 *
 * Or as a global post-hook using response interception:
 *   app.use(auditLog());
 */

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Returns Express middleware that logs the request to audit_logs.
 * @param {string} [tableName] - override the table name; if not provided, inferred from path
 */
const auditLog = (tableName) => (req, res, next) => {
  if (!MUTATING_METHODS.has(req.method)) return next();

  // Intercept res.json to capture status after response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Infer table from first path segment after /api/
    const inferredTable = tableName ||
      (req.path.split('/').filter(Boolean)[0] ?? 'unknown');

    const userId  = req.user?.userId ?? null;
    const role    = req.user?.role   ?? null;
    const ip      = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
    const agent   = req.get('user-agent') || null;
    const action  = req.method;
    const newData = (body && typeof body === 'object') ? JSON.stringify(body).slice(0, 4000) : null;

    // Fire-and-forget — never await, never throw
    pool.query(
      `INSERT INTO audit_logs
         (user_id, table_name, action, new_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, inferredTable, action, newData, ip, agent]
    ).catch((err) => console.error('[audit] DB write failed:', err.message));

    return originalJson(body);
  };

  next();
};

export default auditLog;
