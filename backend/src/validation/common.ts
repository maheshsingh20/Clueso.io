import Joi from 'joi';

export const mongoIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  });

export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  sort: Joi.string()
    .valid('createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name')
    .default('-createdAt')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Search query cannot exceed 100 characters'
    })
});

export const paramsIdSchema = Joi.object({
  id: mongoIdSchema
});