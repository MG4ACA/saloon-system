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

// Generic validate middleware factory
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.body = value; // use coerced values (e.g. default role)
  next();
};

export { loginSchema, registerSchema, updateStatusSchema, updateUserSchema };
