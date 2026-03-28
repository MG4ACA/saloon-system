import CommissionRule from '../models/CommissionRule.js';
import Service from '../models/Service.js';

export const getServices = async (req, res) => {
  try {
    const filters = {};
    if (req.query.categoryId) filters.categoryId = req.query.categoryId;
    if (req.query.active !== undefined) filters.isActive = req.query.active !== 'false';
    const services = await Service.findAll(filters);
    res.json({ services });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json({ service });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, categoryId, description, duration, basePrice, commission } = req.body;
    const serviceId = await Service.create({ name, categoryId, description, duration, basePrice });
    if (commission) {
      await CommissionRule.upsertForService(serviceId, commission);
    }
    const service = await Service.findById(serviceId);
    res.status(201).json({ message: 'Service created', service });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    const { name, categoryId, description, duration, basePrice, commission } = req.body;
    await Service.update(id, { name, categoryId, description, duration, basePrice });
    if (commission) {
      await CommissionRule.upsertForService(id, commission);
    }
    const service = await Service.findById(id);
    res.json({ message: 'Service updated', service });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const existing = await Service.findById(id);
    if (!existing) return res.status(404).json({ error: 'Service not found' });
    await Service.setActive(id, isActive);
    res.json({ message: `Service ${isActive ? 'activated' : 'deactivated'}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
