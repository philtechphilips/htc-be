const pool = require('../config/db');
const { errorResponse, successResponse } = require('../utils/helpers/response');
const { v4: uuidv4 } = require('uuid');
const schema = require('../utils/schema');
const nodemailer = require('nodemailer');

// Add product to cart
exports.addToCart = async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;
  try {
    const product = await schema.fetchOne('products', { id: product_id });
    if (!product) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }
    let cartRows = await schema.fetchData('cart', { user_id, product_id });
    if (cartRows.length) {
      await schema.update(
        'cart',
        { user_id, product_id },
        { quantity: cartRows[0].quantity + quantity }
      );
    } else {
      await schema.create('cart', { id: uuidv4(), user_id, product_id, quantity });
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Product added to cart',
      payload: null,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  const user_id = req.user.id;
  try {
    // Use schema.fetchData with populate option
    const cart = await schema.fetchData(
      'cart',
      { user_id },
      { populate: [{ field: 'product_id', table: 'products', as: 'product' }] }
    );
    return successResponse(res, { statusCode: 200, message: 'Cart fetched', payload: cart });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.body;
  try {
    await schema.deleteItem('cart', { user_id, product_id });
    return successResponse(res, {
      statusCode: 200,
      message: 'Product removed from cart',
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Update product quantity in cart
exports.updateCart = async (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;
  try {
    const cartRows = await schema.fetchData('cart', { user_id, product_id });
    if (!cartRows.length) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found in cart' });
    }
    await schema.update('cart', { user_id, product_id }, { quantity });
    return successResponse(res, { statusCode: 200, message: 'Cart updated', payload: null });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Checkout: create order and send email notification
exports.checkout = async (req, res) => {
  // Use validated request body data
  const {
    userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    address,
    apartment,
    street,
    city,
    state,
    cart: cartItems,
  } = req.body;
  try {
    // Fetch product details for each cart item
    const detailedCart = [];
    for (const item of cartItems) {
      const product = await schema.fetchOne('products', { id: item.productId });
      if (!product) {
        return errorResponse(res, {
          statusCode: 404,
          message: `Product not found: ${item.productId}`,
        });
      }
      detailedCart.push({
        ...item,
        product,
      });
    }
    if (!detailedCart.length) {
      return errorResponse(res, { statusCode: 400, message: 'Cart is empty' });
    }

    // Call createOrder directly with the real response object
    const orderController = require('./orderController');
    await orderController.createOrder(req, res);
  } catch (err) {
    console.error('Checkout error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
