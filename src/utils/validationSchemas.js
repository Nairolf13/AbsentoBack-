const Joi = require('joi');

const absenceCreateSchema = Joi.object({
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  type: Joi.string().valid('maladie', 'congé', 'autre').required(),
  motif: Joi.string().min(2).max(255).required()
});

const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  nom: Joi.string().min(2).max(50).required(),
  prenom: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

const taskCreateSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  dueDate: Joi.date().optional(),
  userId: Joi.number().integer().optional() 
});

module.exports = {
  absenceCreateSchema,
  userRegisterSchema,
  loginSchema,
  taskCreateSchema
};
