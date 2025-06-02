const Joi = require('joi');
const { errorResponse } = require('../utils/helpers/response');

const checkoutSchema = Joi.object({
  userId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().required(),
  apartment: Joi.string().allow(''),
  street: Joi.string().allow(''),
  city: Joi.string().required(),
  state: Joi.string().required(),
  cart: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

const validateCheckout = (req, res, next) => {
  const { error } = checkoutSchema.validate(req.body);
  if (error) {
    return errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateCheckout, checkoutSchema };
