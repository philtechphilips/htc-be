const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { errorResponse, successResponse } = require('../utils/helpers/response');

exports.contactUs = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    // Optionally save to DB here if needed
    // Send email to admin
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const adminEmail = process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'Contact Us Message',
      text: `Contact Us Message\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };
    await transporter.sendMail(mailOptions);
    return successResponse(res, {
      statusCode: 200,
      message: 'Message sent successfully.',
      payload: null,
    });
  } catch (err) {
    console.error('Contact Us error:', err);
    return errorResponse(res, { statusCode: 500, message: 'Server error' });
  }
};
