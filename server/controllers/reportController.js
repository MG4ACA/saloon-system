import Report from '../models/Report.js';

// Resolve default date range: first of current month → today
const getDateRange = (query) => {
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().slice(0, 10);
  const defaultTo = today.toISOString().slice(0, 10);
  return {
    from: query.from || defaultFrom,
    to:   query.to   || defaultTo,
  };
};

// GET /api/reports/sales?from=&to=
export const getSalesReport = async (req, res) => {
  try {
    const range = getDateRange(req.query);
    const data = await Report.getSalesSummary(range);
    res.json({ ...data, ...range });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/reports/employees?from=&to=
export const getEmployeeReport = async (req, res) => {
  try {
    const range = getDateRange(req.query);
    const employees = await Report.getEmployeeReport(range);
    res.json({ employees, ...range });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/reports/services?from=&to=
export const getServiceReport = async (req, res) => {
  try {
    const range = getDateRange(req.query);
    const services = await Report.getServiceReport(range);
    res.json({ services, ...range });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
