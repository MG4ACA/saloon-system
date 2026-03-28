import pool from '../config/database.js';

const ServicePackage = {
  async findAll() {
    const [pkgs] = await pool.query(
      `SELECT sp.*, u.name AS createdByName
       FROM service_packages sp
       LEFT JOIN users u ON u.id = sp.created_by
       WHERE sp.is_deleted = 0
       ORDER BY sp.name`,
    );
    if (!pkgs.length) return [];

    // Attach service list to each package
    const ids = pkgs.map((p) => p.id);
    const [services] = await pool.query(
      `SELECT ps.package_id, s.id, s.name, s.base_price, s.duration
       FROM package_services ps
       JOIN services s ON s.id = ps.service_id
       WHERE ps.package_id IN (?)`,
      [ids],
    );

    const serviceMap = {};
    services.forEach((s) => {
      if (!serviceMap[s.package_id]) serviceMap[s.package_id] = [];
      serviceMap[s.package_id].push({
        id: s.id,
        name: s.name,
        basePrice: s.base_price,
        duration: s.duration,
      });
    });

    return pkgs.map((p) => ({ ...p, services: serviceMap[p.id] || [] }));
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM service_packages WHERE id = ? AND is_deleted = 0',
      [id],
    );
    if (!rows[0]) return null;

    const [services] = await pool.query(
      `SELECT s.id, s.name, s.base_price AS basePrice, s.duration
       FROM package_services ps
       JOIN services s ON s.id = ps.service_id
       WHERE ps.package_id = ?`,
      [id],
    );
    return { ...rows[0], services };
  },

  async create({ name, description, packagePrice, locationId, createdBy }, serviceIds = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        `INSERT INTO service_packages (name, description, package_price, location_id, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [name, description || null, packagePrice, locationId || null, createdBy || null],
      );
      const pkgId = result.insertId;
      if (serviceIds.length) {
        const rows = serviceIds.map((sid) => [pkgId, sid]);
        await conn.query('INSERT INTO package_services (package_id, service_id) VALUES ?', [rows]);
      }
      await conn.commit();
      return this.findById(pkgId);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  async update(id, { name, description, packagePrice }, serviceIds = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        'UPDATE service_packages SET name = ?, description = ?, package_price = ? WHERE id = ?',
        [name, description || null, packagePrice, id],
      );
      // Replace services
      await conn.query('DELETE FROM package_services WHERE package_id = ?', [id]);
      if (serviceIds.length) {
        const rows = serviceIds.map((sid) => [id, sid]);
        await conn.query('INSERT INTO package_services (package_id, service_id) VALUES ?', [rows]);
      }
      await conn.commit();
      return this.findById(id);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  async setActive(id, isActive) {
    await pool.query('UPDATE service_packages SET is_active = ? WHERE id = ?', [
      isActive ? 1 : 0,
      id,
    ]);
  },
};

export default ServicePackage;
