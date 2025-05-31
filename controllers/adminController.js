const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const schema = require("../utils/schema");
const { errorResponse, successResponse } = require("../utils/helpers/response");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await schema.fetchOne("users", { email });
    if (user)
      return errorResponse(res, {
        statusCode: 400,
        message: "Admin already exists",
      });
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await schema.create("users", {
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
    });
    const newUser = await schema.fetchOne("users", { id });
    if (newUser && newUser.password) delete newUser.password;
    return successResponse(res, {
      statusCode: 201,
      message: "Admin registered",
      payload: newUser,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await schema.fetchOne("users", { email, role: "admin" });
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
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const { password: _pw, ...userWithoutPassword } = user;
    return successResponse(res, {
      statusCode: 200,
      message: "Admin signed in successfully!",
      payload: userWithoutPassword,
      token,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};
