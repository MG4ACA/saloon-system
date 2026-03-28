import ServiceCategory from '../models/ServiceCategory.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll();
    res.json({ categories });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const duplicate = await ServiceCategory.findByName(name);
    if (duplicate) return res.status(409).json({ error: 'A category with that name already exists' });
    const category = await ServiceCategory.create({ name, description });
    res.status(201).json({ message: 'Category created', category });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const existing = await ServiceCategory.findById(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const duplicate = await ServiceCategory.findByName(name, id);
    if (duplicate) return res.status(409).json({ error: 'A category with that name already exists' });
    const category = await ServiceCategory.update(id, { name, description });
    res.json({ message: 'Category updated', category });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const existing = await ServiceCategory.findById(id);
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    await ServiceCategory.setActive(id, isActive);
    res.json({ message: `Category ${isActive ? 'activated' : 'deactivated'}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
