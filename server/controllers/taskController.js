import Commission from '../models/Commission.js';
import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filters = { isAdmin };

    // Employee always sees only their own tasks
    if (!isAdmin) filters.employeeId = req.user.userId;

    // Admin can filter by employee
    if (isAdmin && req.query.employeeId) filters.employeeId = req.query.employeeId;

    if (req.query.status) filters.status = req.query.status;
    if (req.query.serviceId) filters.serviceId = req.query.serviceId;
    if (req.query.date) filters.date = req.query.date;
    if (req.query.all === 'true') filters.allDates = true;

    const tasks = await Task.findAll(filters);
    res.json({ tasks });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskSummary = async (req, res) => {
  try {
    const summary = await Task.getSummary(req.user.userId);
    res.json({ summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Employee can only view own tasks
    if (req.user.role !== 'admin' && task.employee_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ task });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { serviceId, customerId, startTime, endTime, price, discountType, discountValue, notes, status } = req.body;
    const task = await Task.create({
      employeeId: req.user.userId,
      customerId,
      serviceId,
      startTime,
      endTime,
      price,
      discountType,
      discountValue,
      notes,
      status,
    });
    res.status(201).json({ message: 'Task created', task });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.employee_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const updated = await Task.update(req.params.id, req.body);
    res.json({ message: 'Task updated', task: updated });
  } catch (e) {
    if (e.message === 'LOCKED') return res.status(403).json({ error: 'Task is locked. Records cannot be modified after 24 hours.' });
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.employee_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const updated = await Task.updateStatus(req.params.id, status);

    // Auto-calculate commission when task is completed
    if (status === 'completed') {
      try {
        const calc = await Commission.calculate(updated);
        await Commission.upsert(updated, calc);
      } catch (commErr) {
        // Log but never block the status update
        console.error('Commission calculation error (non-fatal):', commErr.message);
      }
    }

    res.json({ message: 'Status updated', task: updated });
  } catch (e) {
    if (e.message === 'LOCKED') return res.status(403).json({ error: 'Task is locked. Records cannot be modified after 24 hours.' });
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
