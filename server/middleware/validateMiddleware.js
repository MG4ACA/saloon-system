import Joi from 'joi';

// Joi schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Last name is required',
  }),
  role: Joi.string().valid('admin', 'employee').default('employee'),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  role: Joi.string().valid('admin', 'employee'),
});

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive (true/false) is required',
  }),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Category name is required',
  }),
  description: Joi.string().max(500).allow('', null),
});

const serviceSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Service name is required',
  }),
  categoryId: Joi.number().integer().required().messages({
    'any.required': 'Category is required',
  }),
  description: Joi.string().max(500).allow('', null),
  duration: Joi.number().integer().min(1).required().messages({
    'any.required': 'Duration (minutes) is required',
  }),
  basePrice: Joi.number().precision(2).min(0).required().messages({
    'any.required': 'Base price is required',
  }),
  commission: Joi.object({
    commissionType: Joi.string().valid('percentage', 'fixed').required(),
    commissionValue: Joi.number().precision(2).min(0).required(),
    applyAfterDiscount: Joi.boolean().default(true),
  }).allow(null),
  locationId: Joi.number().integer().allow(null),
});

const packageSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Package name is required',
  }),
  description: Joi.string().max(500).allow('', null),
  packagePrice: Joi.number().precision(2).min(0).required().messages({
    'any.required': 'Package price is required',
  }),
  serviceIds: Joi.array().items(Joi.number().integer()).min(1).required().messages({
    'any.required': 'At least one service must be selected',
    'array.min': 'At least one service must be selected',
  }),
  locationId: Joi.number().integer().allow(null),
});

const statusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive (true/false) is required',
  }),
});

const taskSchema = Joi.object({
  serviceId: Joi.number().integer().required().messages({
    'any.required': 'Service is required',
  }),
  customerId: Joi.number().integer().allow(null),
  startTime: Joi.date().iso().required().messages({
    'any.required': 'Start time is required',
  }),
  endTime: Joi.date().iso().allow(null),
  price: Joi.number().precision(2).min(0).required().messages({
    'any.required': 'Price is required',
  }),
  discountType: Joi.string().valid('percentage', 'fixed').allow(null),
  discountValue: Joi.number().precision(2).min(0).allow(null),
  notes: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
});

const taskStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of: pending, in_progress, completed, cancelled',
  }),
});

const customerSchema = Joi.object({
  phone: Joi.string().min(7).max(20).required().messages({
    'any.required': 'Phone number is required',
  }),
  name: Joi.string().min(1).max(255).required().messages({
    'any.required': 'Customer name is required',
  }),
  email: Joi.string().email().allow('', null),
});

// Generic validate middleware factory
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = value;
  next();
};

export {
  categorySchema,
  customerSchema,
  loginSchema,
  packageSchema,
  registerSchema,
  serviceSchema,
  statusSchema,
  taskSchema,
  taskStatusSchema,
  updateStatusSchema,
  updateUserSchema,
};
