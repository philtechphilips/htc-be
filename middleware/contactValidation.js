const Joi = require('joi');

exports.contactUsSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(5).max(1000).required(),
});
