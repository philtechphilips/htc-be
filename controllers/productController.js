const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const schema = require("../utils/schema");
const { errorResponse, successResponse } = require("../utils/helpers/response");

exports.addCategory = async (req, res) => {
  const { name, description, image } = req.body;
  try {
    const id = uuidv4();
    await pool.query(
      "INSERT INTO categories (id, name, description, image) VALUES (?, ?, ?, ?)",
      [id, name, description, image]
    );
    return successResponse(res, {
      statusCode: 201,
      message: "Category created",
      payload: { id, name, description, image },
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query("SELECT * FROM categories");
    // For each category, count products
    for (const cat of categories) {
      const [rows] = await pool.query(
        "SELECT COUNT(*) as productCount FROM products WHERE category_id = ?",
        [cat.id]
      );
      cat.productCount = rows[0].productCount;
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Categories fetched",
      payload: categories,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.addProduct = async (req, res) => {
  const { name, slug, image, category_id, details, images } = req.body;
  try {
    // Check category exists
    const [catRows] = await pool.query("SELECT id FROM categories WHERE id = ?", [category_id]);
    if (catRows.length === 0) {
      return errorResponse(res, { statusCode: 400, message: "Category not found" });
    }
    const id = uuidv4();
    await pool.query(
      "INSERT INTO products (id, name, slug, image, category_id, details, images) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, slug, image, category_id, details, JSON.stringify(images)]
    );
    return successResponse(res, {
      statusCode: 201,
      message: "Product created",
      payload: { id, name, slug, image, category_id, details, images },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, { statusCode: 400, message: "Slug already exists" });
    }
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products WHERE isDeleted = 0");
    return successResponse(res, {
      statusCode: 200,
      message: "Products fetched",
      payload: products,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const { category_id } = req.params;
  try {
    const [products] = await pool.query(
      "SELECT * FROM products WHERE category_id = ? AND isDeleted = 0",
      [category_id]
    );
    return successResponse(res, {
      statusCode: 200,
      message: "Products fetched",
      payload: products,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await pool.query(
      "SELECT * FROM products WHERE id = ? AND isDeleted = 0",
      [id]
    );
    if (!products.length) {
      return errorResponse(res, { statusCode: 404, message: "Product not found" });
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Product fetched",
      payload: products[0],
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const [products] = await pool.query(
      "SELECT * FROM products WHERE slug = ? AND isDeleted = 0",
      [slug]
    );
    if (!products.length) {
      return errorResponse(res, { statusCode: 404, message: "Product not found" });
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Product fetched",
      payload: products[0],
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE products SET isDeleted = 1 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return errorResponse(res, { statusCode: 404, message: "Product not found" });
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Product deleted",
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE products SET ? WHERE id = ? AND isDeleted = 0",
      [updateData, id]
    );
    if (result.affectedRows === 0) {
      return errorResponse(res, { statusCode: 404, message: "Product not found or already deleted" });
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Product updated",
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE categories SET isDeleted = 1 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return errorResponse(res, { statusCode: 404, message: "Category not found" });
    }
    return successResponse(res, {
      statusCode: 200,
      message: "Category deleted",
      payload: null,
    });
  } catch (err) {
    return errorResponse(res, { statusCode: 500, message: "Server error" });
  }
};
