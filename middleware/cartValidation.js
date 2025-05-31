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

const addToCartSchema = Joi.object({
  product_id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const removeFromCartSchema = Joi.object({
  product_id: Joi.string().required(),
});

module.exports = {
  validate,
  addToCartSchema,
  removeFromCartSchema,
};