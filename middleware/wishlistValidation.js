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

const addToWishlistSchema = Joi.object({
  product_id: Joi.string().required(),
});

const removeFromWishlistSchema = Joi.object({
  product_id: Joi.string().required(),
});

module.exports = {
  validate,
  addToWishlistSchema,
  removeFromWishlistSchema,
};