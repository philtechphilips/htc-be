const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { validate, categorySchema, productSchema, updateProductSchema } = require("../middleware/authValidation");
const { requireRole } = require("../middleware/role");

/**
 * @swagger
 * /api/product/category:
 *   post:
 *     summary: Add a new category
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 *       500:
 *         description: Server error
 */
router.post("/category", requireRole("admin"), validate(categorySchema), productController.addCategory);

/**
 * @swagger
 * /api/product/category:
 *   get:
 *     summary: Get all categories (with product count)
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Categories fetched
 *       500:
 *         description: Server error
 */
router.get("/category", productController.getCategories);

/**
 * @swagger
 * /api/product/category/{id}:
 *   delete:
 *     summary: Delete a category (cold delete)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/category/:id", requireRole("admin"), productController.deleteCategory);

/**
 * @swagger
 * /api/product/product:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Slug already exists or category not found
 *       500:
 *         description: Server error
 */
router.post("/product", requireRole("admin"), validate(productSchema), productController.addProduct);

/**
 * @swagger
 * /api/product/product:
 *   get:
 *     summary: Fetch all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Products fetched
 *       500:
 *         description: Server error
 */
router.get("/product", productController.getProducts);

/**
 * @swagger
 * /api/product/product/{id}:
 *   get:
 *     summary: Fetch product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/product/:id", productController.getProductById);

/**
 * @swagger
 * /api/product/product/slug/{slug}:
 *   get:
 *     summary: Fetch product by slug
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Product fetched
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/product/slug/:slug", productController.getProductBySlug);

/**
 * @swagger
 * /api/product/product/category/{category_id}:
 *   get:
 *     summary: Fetch products by category
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Products fetched
 *       500:
 *         description: Server error
 */
router.get("/product/category/:category_id", productController.getProductsByCategory);

/**
 * @swagger
 * /api/product/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/product/:id", requireRole("admin"), validate(updateProductSchema), productController.updateProduct);

/**
 * @swagger
 * /api/product/product/{id}:
 *   delete:
 *     summary: Delete a product (cold delete)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/product/:id", requireRole("admin"), productController.deleteProduct);

module.exports = router;
