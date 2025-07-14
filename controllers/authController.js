const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const schema = require('../utils/schema');
const { errorResponse, successResponse } = require('../utils/helpers/response');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (user)
      return errorResponse(res, {
        statusCode: 400,
        message: 'User already exists',
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await schema.create('users', {
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const newUser = await schema.fetchOne('users', { id });
    if (newUser && newUser.password) delete newUser.password;
    return successResponse(res, {
      statusCode: 201,
      message: 'User registered',
      payload: newUser,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await schema.fetchOne('users', { email });
    if (!user)
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid credentials',
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return errorResponse(res, {
        statusCode: 400,
        message: 'Invalid credentials',
      });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const { password: _pw, ...userWithoutPassword } = user;
    return successResponse(res, {
      statusCode: 200,
      message: 'Signed in successfully!',
      payload: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.log('Login error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await schema.fetchOne('users', { email });

    if (!user) {
      return errorResponse(res, { statusCode: 400, message: 'User not found' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Check SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP server is ready to take messages');
    } catch (smtpError) {
      console.error('SMTP connection error:', smtpError);
      return errorResponse(res, {
        statusCode: 500,
        message: 'Email service error',
      });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Reset your password by clicking this link: ${resetLink}`,
      html: `<p>Reset your password by clicking <a href="${resetLink}">this link</a>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, {
      statusCode: 200,
      message: 'Password reset email sent',
      payload: null,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const user_id = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    console.log('Change password request for user:', user_id);

    // Get current user with password
    const user = await schema.fetchOne('users', { id: user_id });
    if (!user) {
      console.log('User not found:', user_id);
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }

    console.log('User found:', { id: user.id, email: user.email });
    console.log('Current password hash:', user.password);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Current password verification failed');
      return errorResponse(res, { statusCode: 400, message: 'Current password is incorrect' });
    }

    console.log('Current password verified, hashing new password...');

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hash:', hashedNewPassword);

    console.log('New password hashed, updating database...');

    // Update password in database
    const updated = await schema.update('users', { id: user_id }, { password: hashedNewPassword });
    console.log('Database update result:', updated);

    if (!updated) {
      console.log('Failed to update password in database');
      return errorResponse(res, { statusCode: 500, message: 'Failed to update password' });
    }

    // Verify the update by fetching the user again
    const updatedUser = await schema.fetchOne('users', { id: user_id });
    console.log('Updated user password hash:', updatedUser.password);

    // Test if the new password works
    const newPasswordTest = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('New password test result:', newPasswordTest);

    if (!newPasswordTest) {
      console.log('New password verification failed after update');
      return errorResponse(res, {
        statusCode: 500,
        message: 'Password update verification failed',
      });
    }

    // Test login with new password
    const loginTest = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Login test with new password:', loginTest);

    console.log('Password updated successfully');

    return successResponse(res, {
      statusCode: 200,
      message: 'Password changed successfully',
      payload: null,
    });
  } catch (err) {
    console.error('Change password error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};

// Update user profile (all fields except password)
exports.updateUser = async (req, res) => {
  const user_id = req.user.id;
  const { firstName, lastName, email, phoneNumber, address, street, apartment, city, state } =
    req.body;
  try {
    // Only update allowed fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (street !== undefined) updateData.street = street;
    if (apartment !== undefined) updateData.apartment = apartment;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, { statusCode: 400, message: 'No valid fields to update' });
    }
    const updated = await schema.update('users', { id: user_id }, updateData);
    if (!updated) {
      return errorResponse(res, { statusCode: 404, message: 'User not found' });
    }
    const user = await schema.fetchOne('users', { id: user_id });
    if (user && user.password) delete user.password;
    return successResponse(res, {
      statusCode: 200,
      message: 'User profile updated',
      payload: user,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
