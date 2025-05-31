const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const schema = require("../utils/schema");
const { errorResponse, successResponse } = require("../utils/helpers/response");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await schema.fetchOne("users", { email });
    if (user)
      return errorResponse(res, {
        statusCode: 400,
        message: "User already exists",
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await schema.create("users", {
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const newUser = await schema.fetchOne("users", { id });
    if (newUser && newUser.password) delete newUser.password;
    return successResponse(res, {
      statusCode: 201,
      message: "User registered",
      payload: newUser,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await schema.fetchOne("users", { email });
    if (!user)
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid credentials",
      });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid credentials",
      });
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const { password: _pw, ...userWithoutPassword } = user;
    return successResponse(res, {
      statusCode: 200,
      message: "Signed in successfully!",
      payload: userWithoutPassword,
      token,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await schema.fetchOne("users", { email });

    if (!user) {
      return errorResponse(res, { statusCode: 400, message: "User not found" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
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
      console.log("SMTP server is ready to take messages");
    } catch (smtpError) {
      console.error("SMTP connection error:", smtpError);
      return errorResponse(res, {
        statusCode: 500,
        message: "Email service error",
      });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Reset your password by clicking this link: ${resetLink}`,
      html: `<p>Reset your password by clicking <a href="${resetLink}">this link</a>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return successResponse(res, {
      statusCode: 200,
      message: "Password reset email sent",
      payload: null,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};
