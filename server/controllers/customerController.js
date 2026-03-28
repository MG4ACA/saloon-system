import Customer from '../models/Customer.js';

export const lookupCustomer = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'phone query param required' });

    const customer = await Customer.findByPhone(phone);
    if (customer) {
      res.json({ found: true, customer });
    } else {
      res.json({ found: false, customer: null });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { phone, name, email } = req.body;
    const existing = await Customer.findByPhone(phone);
    if (existing) return res.status(409).json({ error: 'Customer with this phone already exists', customer: existing });

    const customer = await Customer.create({ phone, name, email });
    res.status(201).json({ message: 'Customer created', customer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll(req.query.search || '');
    res.json({ customers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
