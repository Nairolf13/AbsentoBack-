// Exemple de validation stricte pour une création d'absence
const Joi = require('joi');

const absenceCreateSchema = Joi.object({
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required(),
  type: Joi.string().valid('maladie', 'congé', 'autre').required(),
  motif: Joi.string().min(2).max(255).required()
});

// --- Schéma de validation pour l'inscription utilisateur ---
const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  nom: Joi.string().min(2).max(50).required(),
  prenom: Joi.string().min(2).max(50).required()
});

// --- Schéma de validation pour le login ---
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});

// --- Schéma de validation pour la création de tâche ---
const taskCreateSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  dueDate: Joi.date().optional(),
  userId: Joi.number().integer().optional() // <-- Ajouté pour permettre l'assignation
});

module.exports = {
  absenceCreateSchema,
  userRegisterSchema,
  loginSchema,
  taskCreateSchema
};
