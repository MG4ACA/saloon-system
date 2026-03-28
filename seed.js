/**
 * Salon POS — Sample Data Seed
 *
 * Populates the database with realistic sample data spanning Jan–Mar 2026.
 * Safe to re-run: skips insertion if data already exists (idempotent).
 *
 * Run with:  npm run seed
 */

import bcrypt from 'bcryptjs';
import pool from './server/config/database.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Random integer between min and max (inclusive) */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Random element from array */
const pick = (arr) => arr[rand(0, arr.length - 1)];

/** Random datetime between two Date objects, returned as MySQL DATETIME string */
const randDatetime = (from, to) => {
  const ms = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
};

/** Add minutes to a MySQL DATETIME string */
const addMinutes = (datetimeStr, minutes) => {
  const d = new Date(datetimeStr.replace(' ', 'T') + 'Z');
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

// ─── Seed Data Definitions ──────────────────────────────────────────────────

const LOCATION_ID = 1; // inserted by schema default

const USERS = [
  { name: 'System Admin', email: 'admin@salon.com', password: 'admin123', role: 'admin' },
  { name: 'Nimal Perera', email: 'nimal@salon.com', password: 'employee123', role: 'employee' },
  { name: 'Dilini Silva', email: 'dilini@salon.com', password: 'employee123', role: 'employee' },
  { name: 'Kasun Fernando', email: 'kasun@salon.com', password: 'employee123', role: 'employee' },
  {
    name: 'Ishara Rajapaksa',
    email: 'ishara@salon.com',
    password: 'employee123',
    role: 'employee',
  },
];

const CATEGORIES = [
  { name: 'Hair Services', description: 'Haircuts, colouring, treatments and styling' },
  { name: 'Nail Services', description: 'Manicure, pedicure and nail art' },
  { name: 'Beauty & Skin', description: 'Facials, waxing and skin treatments' },
  { name: 'Spa & Wellness', description: 'Massages and relaxation therapies' },
];

// Services per category (name, duration_min, base_price, commission_pct)
const SERVICES_BY_CATEGORY = {
  'Hair Services': [
    { name: 'Ladies Haircut', duration: 45, price: 1500, commission: 20 },
    { name: 'Gents Haircut', duration: 30, price: 800, commission: 20 },
    { name: 'Hair Colouring (Full)', duration: 120, price: 5500, commission: 25 },
    { name: 'Highlights', duration: 90, price: 4000, commission: 25 },
    { name: 'Keratin Treatment', duration: 150, price: 8000, commission: 30 },
    { name: 'Hair Spa', duration: 60, price: 2500, commission: 20 },
  ],
  'Nail Services': [
    { name: 'Basic Manicure', duration: 30, price: 900, commission: 20 },
    { name: 'Gel Manicure', duration: 45, price: 1800, commission: 22 },
    { name: 'Basic Pedicure', duration: 40, price: 1100, commission: 20 },
    { name: 'Gel Pedicure', duration: 60, price: 2200, commission: 22 },
    { name: 'Nail Art (per hand)', duration: 30, price: 700, commission: 20 },
  ],
  'Beauty & Skin': [
    { name: 'Classic Facial', duration: 60, price: 2800, commission: 22 },
    { name: 'Brightening Facial', duration: 75, price: 3500, commission: 22 },
    { name: 'Full Body Waxing', duration: 90, price: 4500, commission: 25 },
    { name: 'Eyebrow Threading', duration: 15, price: 350, commission: 20 },
    { name: 'Eyelash Extensions', duration: 90, price: 5000, commission: 25 },
  ],
  'Spa & Wellness': [
    { name: 'Swedish Massage (60 min)', duration: 60, price: 4500, commission: 25 },
    { name: 'Deep Tissue Massage', duration: 75, price: 5500, commission: 25 },
    { name: 'Foot Reflexology', duration: 45, price: 2500, commission: 20 },
    { name: 'Aromatherapy Massage', duration: 60, price: 5000, commission: 25 },
  ],
};

const CUSTOMER_NAMES = [
  'Amara Wickramasinghe',
  'Buddhika Jayawardena',
  'Chamari Dissanayake',
  'Dilrukshi Rathnayake',
  'Eranga Pathirana',
  'Fathima Rizvi',
  'Gayani Senanayake',
  'Hasini Kumari',
  'Indika Weerasinghe',
  'Janani Mudalige',
  'Kavya Herath',
  'Lakshmi Nanayakkara',
  'Malika Gunathilake',
  'Nethmi Samaraweera',
  'Oshadi Bamunusinghe',
  'Priya Thilakarathna',
  'Qadri Ahamed',
  'Renuka Jayasooriya',
  'Sanduni Madushanka',
  'Tharini Rajapaksha',
  'Udari Wijesekara',
  'Vimala Kodituwakku',
  'Waruni Alahakoon',
  'Yashodha Liyanage',
  'Zara Fonseka',
];

// ─── Seeding Logic ──────────────────────────────────────────────────────────

const seed = async () => {
  const conn = await pool.getConnection();
  try {
    console.log('🌱 Starting sample data seed...\n');

    // ── 1. Check if already seeded ───────────────────────────────────────────
    const [[{ cnt }]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM users WHERE email != 'admin@salon.com'",
    );
    if (cnt > 0) {
      console.log('⚠️  Sample data already exists. Skipping seed to avoid duplicates.');
      console.log('   If you want to re-seed, clear the tables first.');
      return;
    }

    // ── 2. Users ─────────────────────────────────────────────────────────────
    console.log('👤 Seeding users...');
    const userIds = {};
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      const [res] = await conn.query(
        `INSERT IGNORE INTO users (name, email, password_hash, role, status, is_deleted, location_id)
         VALUES (?, ?, ?, ?, 'active', 0, ?)`,
        [u.name, u.email, hash, u.role, LOCATION_ID],
      );
      if (res.insertId) {
        userIds[u.email] = res.insertId;
      } else {
        const [[existing]] = await conn.query('SELECT id FROM users WHERE email = ?', [u.email]);
        userIds[u.email] = existing.id;
      }
    }
    console.log(`   ✅ ${Object.keys(userIds).length} users created`);

    // ── 3. Employees ─────────────────────────────────────────────────────────
    console.log('💇 Seeding employees...');
    const employeeUserEmails = [
      'nimal@salon.com',
      'dilini@salon.com',
      'kasun@salon.com',
      'ishara@salon.com',
    ];
    const salaryTypes = ['commission', 'commission', 'hybrid', 'commission'];
    const baseSalaries = [null, null, 25000.0, null];
    const employeeIdByEmail = {};

    for (let i = 0; i < employeeUserEmails.length; i++) {
      const email = employeeUserEmails[i];
      const userId = userIds[email];
      const [res] = await conn.query(
        `INSERT IGNORE INTO employees (user_id, salary_type, base_salary, is_active, is_deleted, location_id)
         VALUES (?, ?, ?, 1, 0, ?)`,
        [userId, salaryTypes[i], baseSalaries[i], LOCATION_ID],
      );
      if (res.insertId) {
        employeeIdByEmail[email] = res.insertId;
      } else {
        const [[existing]] = await conn.query('SELECT id FROM employees WHERE user_id = ?', [
          userId,
        ]);
        employeeIdByEmail[email] = existing.id;
      }
    }
    console.log(`   ✅ ${employeeUserEmails.length} employees created`);

    // ── 4. Service Categories ────────────────────────────────────────────────
    console.log('📂 Seeding service categories...');
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const [res] = await conn.query(
        `INSERT IGNORE INTO service_categories (name, description, is_deleted, location_id)
         VALUES (?, ?, 0, ?)`,
        [cat.name, cat.description, LOCATION_ID],
      );
      if (res.insertId) {
        categoryIds[cat.name] = res.insertId;
      } else {
        const [[existing]] = await conn.query('SELECT id FROM service_categories WHERE name = ?', [
          cat.name,
        ]);
        categoryIds[cat.name] = existing.id;
      }
    }
    console.log(`   ✅ ${CATEGORIES.length} categories created`);

    // ── 5. Services ──────────────────────────────────────────────────────────
    console.log('✂️  Seeding services...');
    const serviceList = []; // { id, duration, price }
    for (const [catName, services] of Object.entries(SERVICES_BY_CATEGORY)) {
      const catId = categoryIds[catName];
      for (const svc of services) {
        const [res] = await conn.query(
          `INSERT IGNORE INTO services
             (name, category_id, duration, base_price, commission_type, commission_value,
              is_active, is_deleted, location_id)
           VALUES (?, ?, ?, ?, 'percentage', ?, 1, 0, ?)`,
          [svc.name, catId, svc.duration, svc.price, svc.commission, LOCATION_ID],
        );
        let svcId;
        if (res.insertId) {
          svcId = res.insertId;
        } else {
          const [[existing]] = await conn.query(
            'SELECT id FROM services WHERE name = ? AND category_id = ?',
            [svc.name, catId],
          );
          svcId = existing.id;
        }
        serviceList.push({
          id: svcId,
          duration: svc.duration,
          price: svc.price,
          commission: svc.commission,
        });
      }
    }
    console.log(`   ✅ ${serviceList.length} services created`);

    // ── 6. Commission Rules ──────────────────────────────────────────────────
    console.log('💰 Seeding commission rules...');
    let commissionCount = 0;
    for (const svc of serviceList) {
      const [res] = await conn.query(
        `INSERT IGNORE INTO commission_rules
           (service_id, commission_percentage, apply_after_discount, is_active)
         VALUES (?, ?, 1, 1)`,
        [svc.id, svc.commission],
      );
      if (res.insertId) commissionCount++;
    }
    console.log(`   ✅ ${commissionCount} commission rules created`);

    // ── 7. Customers ─────────────────────────────────────────────────────────
    console.log('👩 Seeding customers...');
    const customerIds = [];
    for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
      const name = CUSTOMER_NAMES[i];
      const phone = `07${String(10000000 + i).slice(1)}`;
      const email = name.split(' ')[0].toLowerCase() + '@example.com';
      const prefEmpEmail = pick(employeeUserEmails);
      const [res] = await conn.query(
        `INSERT IGNORE INTO customers
           (phone, name, email, preferred_employee_id, is_deleted, location_id)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [phone, name, email, userIds[prefEmpEmail], LOCATION_ID],
      );
      if (res.insertId) {
        customerIds.push(res.insertId);
      } else {
        const [[existing]] = await conn.query('SELECT id FROM customers WHERE phone = ?', [phone]);
        customerIds.push(existing.id);
      }
    }
    console.log(`   ✅ ${customerIds.length} customers created`);

    // ── 8. Tasks (past 3 months: Jan–Mar 2026) ───────────────────────────────
    console.log('📋 Seeding tasks (Jan–Mar 2026)...');
    const periodStart = new Date('2026-01-01T08:00:00Z');
    const periodEnd = new Date('2026-03-28T18:00:00Z');
    const statuses = ['completed', 'completed', 'completed', 'completed', 'cancelled'];

    let taskCount = 0;
    // ~6 tasks per working day across 3 months ≈ ~340 tasks
    const TARGET_TASKS = 350;

    for (let t = 0; t < TARGET_TASKS; t++) {
      const empEmail = pick(employeeUserEmails);
      const empUserId = userIds[empEmail];
      const customerId = pick(customerIds);
      const svc = pick(serviceList);
      const status = pick(statuses);
      const startTime = randDatetime(periodStart, periodEnd);
      const endTime = status === 'cancelled' ? null : addMinutes(startTime, svc.duration);

      // Occasional discount
      let discountType = null;
      let discountValue = null;
      if (rand(1, 5) === 1) {
        discountType = pick(['percentage', 'fixed']);
        discountValue =
          discountType === 'percentage' ? pick([5, 10, 15, 20]) : pick([100, 200, 500]);
      }

      await conn.query(
        `INSERT INTO tasks
           (employee_id, customer_id, service_id, start_time, end_time, status,
            price, discount_type, discount_value, is_locked, is_deleted,
            location_id, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
        [
          empUserId,
          customerId,
          svc.id,
          startTime,
          endTime,
          status,
          svc.price,
          discountType,
          discountValue,
          LOCATION_ID,
          empUserId,
          startTime,
        ],
      );
      taskCount++;
    }
    console.log(`   ✅ ${taskCount} tasks created`);

    // ── 9. Update customer totals ────────────────────────────────────────────
    console.log('🔄 Updating customer visit counts and totals...');
    await conn.query(`
      UPDATE customers c
      JOIN (
        SELECT customer_id,
               COUNT(*) AS visits,
               COALESCE(SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END), 0) AS total
        FROM tasks
        WHERE is_deleted = 0
        GROUP BY customer_id
      ) t ON c.id = t.customer_id
      SET c.visit_count = t.visits,
          c.total_spent = t.total
    `);
    console.log('   ✅ Customer totals updated');

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n✅ Seed complete!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Admin login:    admin@salon.com / admin123');
    console.log('  Employee login: nimal@salon.com / employee123');
    console.log('                  dilini@salon.com / employee123');
    console.log('                  kasun@salon.com  / employee123');
    console.log('                  ishara@salon.com / employee123');
    console.log('─────────────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
};

seed();
