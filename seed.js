import bcrypt from 'bcryptjs';
import { User } from './server/models/User.js';

// Create a default admin user
const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findByEmail('admin@salon.com');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the default password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create the admin user
    const userId = await User.create({
      email: 'admin@salon.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
    });

    console.log('✅ Default admin user created successfully');
    console.log('Email: admin@salon.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Run the seeding function
createDefaultAdmin();
