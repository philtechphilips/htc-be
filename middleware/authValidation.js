// Joi validation middleware for auth routes
const Joi = require("joi");
const { errorResponse } = require("../utils/helpers/response");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  next();
};

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
};
