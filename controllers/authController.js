const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (user) return errorResponse(res, { statusCode: 400, message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const userdata = await schema.create('users', { firstName, lastName, email, password: hashedPassword });
    return successResponse(res, { statusCode: 201, message: 'User registered', payload: userdata });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (!user) return errorResponse(res, { statusCode: 400, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, { statusCode: 400, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return successResponse(res, { statusCode: 200, message: 'Login successful', payload: null, token });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (!user) return errorResponse(res, { statusCode: 400, message: 'User not found' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Reset your password using this token: ${token}`
    };
    await transporter.sendMail(mailOptions);
    return successResponse(res, { statusCode: 200, message: 'Password reset email sent', payload: null });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
