const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/helpers/response");

function requireRole(role) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, { statusCode: 401, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== role) {
        return errorResponse(res, { statusCode: 403, message: "Forbidden: Insufficient role" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return errorResponse(res, { statusCode: 401, message: "Invalid token" });
    }
  };
}

module.exports = { requireRole };
