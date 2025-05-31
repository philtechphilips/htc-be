const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const schema = require("../utils/schema");
const { errorResponse, successResponse } = require("../utils/helpers/response");

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.body;
  try {
    const product = await schema.fetchOne("products", { id: product_id });
    if (!product) {
      return errorResponse(res, { statusCode: 404, message: "Product not found" });
    }
    const wishRows = await schema.fetchData("wishlist", { user_id, product_id });
    if (wishRows.length) {
      return errorResponse(res, { statusCode: 400, message: "Product already in wishlist" });
    }
    await schema.create("wishlist", { id: uuidv4(), user_id, product_id });
    return successResponse(res, { statusCode: 200, message: "Product added to wishlist", payload: null });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  const user_id = req.user.id;
  try {
    const wishlist = await schema.fetchData("wishlist", { user_id });
    return successResponse(res, { statusCode: 200, message: "Wishlist fetched", payload: wishlist });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  const user_id = req.user.id;
  const { product_id } = req.body;
  try {
    await schema.deleteItem("wishlist", { user_id, product_id });
    return successResponse(res, { statusCode: 200, message: "Product removed from wishlist", payload: null });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

// Update wishlist (for extensibility, e.g., add notes or priority)
exports.updateWishlist = async (req, res) => {
  const user_id = req.user.id;
  const { product_id, note, priority } = req.body;
  try {
    const wishRows = await schema.fetchData("wishlist", { user_id, product_id });
    if (!wishRows.length) {
      return errorResponse(res, { statusCode: 404, message: "Product not found in wishlist" });
    }
    await schema.update("wishlist", { user_id, product_id }, { note, priority });
    return successResponse(res, { statusCode: 200, message: "Wishlist updated", payload: null });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};
