import Commission from '../models/Commission.js';

// GET /api/commissions/summary?year=&month=
export const getMySummary = async (req, res) => {
  try {
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const summary = await Commission.getMonthlySummary(req.user.userId, year, month);
    res.json({ summary, year, month });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/commissions?employeeId=&year=&month=
export const getCommissions = async (req, res) => {
  try {
    const year       = parseInt(req.query.year)  || new Date().getFullYear();
    const month      = parseInt(req.query.month) || new Date().getMonth() + 1;
    const isAdmin    = req.user.role === 'admin';
    const employeeId = isAdmin && req.query.employeeId
      ? parseInt(req.query.employeeId)
      : req.user.userId;

    const [breakdown, summary] = await Promise.all([
      Commission.getMonthly(employeeId, year, month),
      Commission.getMonthlySummary(employeeId, year, month),
    ]);

    res.json({ breakdown, summary, year, month, employeeId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
