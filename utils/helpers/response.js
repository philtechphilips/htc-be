const safeCompare = require("safe-compare");

const errorResponse = (res, data) => {
  let { statusCode, message } = data;
  return res
    .status(statusCode)
    .send({ status: "failure", statusCode, message, payload: null });
};

const successResponse = (res, data) => {
  let { payload, statusCode, message, token } = data;
  if (safeCompare(token, undefined)) token = null;
  return res
    .status(statusCode)
    .send({ payload, statusCode, message, status: "success", token });
};

module.exports = { errorResponse, successResponse };
