import { Employee } from '../models/Employee.js';

// GET /api/users - List all users (admin only)
export const getAllUsers = async (req, res) => {
  const users = await Employee.findAll();
  res.json({ users });
};

// GET /api/users/:id - Get single user (admin only)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await Employee.findById(Number(id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
};

// PUT /api/users/:id - Update user firstName/lastName/role (admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = await Employee.findById(Number(id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  await Employee.updateUser(Number(id), req.body);
  const updated = await Employee.findById(Number(id));
  res.json({ message: 'User updated successfully', user: updated });
};

// PATCH /api/users/:id/status - Enable or disable a user (admin only)
export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await Employee.findById(Number(id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent admin from disabling themselves
  if (Number(id) === req.user.userId && !isActive) {
    return res.status(400).json({ error: 'You cannot disable your own account' });
  }

  await Employee.updateStatus(Number(id), isActive);
  const action = isActive ? 'enabled' : 'disabled';
  res.json({ message: `User ${action} successfully` });
};

// GET /api/users/stats - Active employee count (admin only)
export const getUserStats = async (req, res) => {
  const activeCount = await Employee.getActiveCount();
  res.json({ activeEmployees: activeCount });
};
