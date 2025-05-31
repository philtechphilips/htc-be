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

// Checkout: send user and cart details to admin email
exports.checkout = async (req, res) => {
  const user_id = req.user.id;
  try {
    // Get user details
    const user = await schema.fetchOne('users', { id: user_id });
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }
    // Get cart with product details
    const cart = await schema.fetchData(
      'cart',
      { user_id },
      { populate: [{ field: 'product_id', table: 'products', as: 'product' }] }
    );
    if (!cart.length) {
      return errorResponse(res, { statusCode: 400, message: 'Cart is empty' });
    }
    // Compose email content
    let productList = cart
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (Qty: ${item.quantity})\n   Details: ${item.product.details}\n   Price: ${item.product.price || 'N/A'}\n`
      )
      .join('\n');
    const emailBody = `New Checkout Order\n\nUser Details:\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\n\nCart Items:\n${productList}`;

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // Send to admin email (from .env or fallback to EMAIL_USER)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'New Checkout Order',
      text: emailBody,
    };
    await transporter.sendMail(mailOptions);
    return successResponse(res, {
      statusCode: 200,
      message: 'Checkout successful. Order sent to admin email.',
      payload: null,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
