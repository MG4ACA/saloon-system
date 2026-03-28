import ServicePackage from '../models/ServicePackage.js';

export const getPackages = async (req, res) => {
  try {
    const packages = await ServicePackage.findAll();
    res.json({ packages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPackage = async (req, res) => {
  try {
    const pkg = await ServicePackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ package: pkg });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPackage = async (req, res) => {
  try {
    const { name, description, packagePrice, serviceIds } = req.body;
    const pkg = await ServicePackage.create(
      { name, description, packagePrice, createdBy: req.user.id },
      serviceIds || []
    );
    res.status(201).json({ message: 'Package created', package: pkg });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ServicePackage.findById(id);
    if (!existing) return res.status(404).json({ error: 'Package not found' });
    const { name, description, packagePrice, serviceIds } = req.body;
    const pkg = await ServicePackage.update(id, { name, description, packagePrice }, serviceIds || []);
    res.json({ message: 'Package updated', package: pkg });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setPackageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const existing = await ServicePackage.findById(id);
    if (!existing) return res.status(404).json({ error: 'Package not found' });
    await ServicePackage.setActive(id, isActive);
    res.json({ message: `Package ${isActive ? 'activated' : 'deactivated'}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
