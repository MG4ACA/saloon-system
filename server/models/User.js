// Using MySQL with Sequelize or raw queries
import db from '../config/database.js';

// Create users table if it doesn't exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

db.query(createUsersTable)
  .then(() => console.log('✅ Users table ensured'))
  .catch((err) => console.error('❌ Error creating users table:', err));

export const User = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Create a new user
  create: async (userData) => {
    const { email, password, firstName, lastName, role = 'employee' } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
      [email, password, firstName, lastName, role],
    );
    return result.insertId;
  },

  // Update last login
  updateLastLogin: async (id) => {
    await db.query('UPDATE users SET lastLogin = NOW() WHERE id = ?', [id]);
  },
};
