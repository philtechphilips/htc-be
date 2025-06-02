const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  validate,
  categorySchema,
  productSchema,
  updateProductSchema,
} = require('../middleware/authValidation');
const { requireRole } = require('../middleware/role');

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
 *           example:
 *             name: "Electronics"
 *             description: "Devices and gadgets"
 *             image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             example:
 *               id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *               name: "Electronics"
 *               description: "Devices and gadgets"
 *               image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *               created_at: "2025-05-31T12:00:00.000Z"
 *       500:
 *         description: Server error
 */
router.post(
  '/category',
  requireRole(['admin']),
  validate(categorySchema),
  productController.addCategory
);

/**
 * @swagger
 * /api/product/categories:
 *   get:
 *     summary: Get all categories (with product count)
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Categories fetched
 *         content:
 *           application/json:
 *             example:
 *               - id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                 name: "Electronics"
 *                 description: "Devices and gadgets"
 *                 image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *                 productCount: 5
 *               - id: "c2b8d9f3-5678-4e12-8def-2345678901bc"
 *                 name: "Books"
 *                 description: "Printed and digital books"
 *                 image: null
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *                 productCount: 10
 *       500:
 *         description: Server error
 */
router.get('/categories', productController.getCategories);

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
router.delete('/category/:id', requireRole(['admin']), productController.deleteCategory);

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Add a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "iPhone 15"
 *             slug: "iphone-15"
 *             image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *             category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *             details: "Latest Apple iPhone with advanced features."
 *             images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *             isFeatured: true
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             example:
 *               id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *               name: "iPhone 15"
 *               slug: "iphone-15"
 *               image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *               category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *               details: "Latest Apple iPhone with advanced features."
 *               images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *               isFeatured: true
 *               isDeleted: false
 *               created_at: "2025-05-31T12:00:00.000Z"
 *       400:
 *         description: Slug already exists or category not found
 *       500:
 *         description: Server error
 */
router.post('/', requireRole(['admin']), validate(productSchema), productController.addProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Fetch all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Products fetched
 *         content:
 *           application/json:
 *             example:
 *               - id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *                 name: "iPhone 15"
 *                 slug: "iphone-15"
 *                 image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *                 category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                 details: "Latest Apple iPhone with advanced features."
 *                 images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *                 isFeatured: true
 *                 isDeleted: false
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *               - id: "e4d0f1g5-8901-4b34-0hij-4567890123de"
 *                 name: "Samsung Galaxy S24"
 *                 slug: "galaxy-s24"
 *                 image: null
 *                 category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                 details: "Latest Samsung flagship."
 *                 images: []
 *                 isFeatured: false
 *                 isDeleted: false
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *       500:
 *         description: Server error
 */
router.get('/products', productController.getProducts);

/**
 * @swagger
 * /api/product/featured:
 *   get:
 *     summary: Fetch all featured products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Featured products fetched
 *         content:
 *           application/json:
 *             example:
 *               - id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *                 name: "iPhone 15"
 *                 slug: "iphone-15"
 *                 image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *                 category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                 details: "Latest Apple iPhone with advanced features."
 *                 images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *                 isFeatured: true
 *                 isDeleted: false
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *                 category:
 *                   id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                   name: "Electronics"
 *                   description: "Devices and gadgets"
 *                   image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *                   created_at: "2025-05-31T12:00:00.000Z"
 *                   isDeleted: false
 *       500:
 *         description: Server error
 */
router.get('/featured', require('../controllers/productController').getFeaturedProducts);

/**
 * @swagger
 * /api/product/{id}:
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
 *         content:
 *           application/json:
 *             example:
 *               id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *               name: "iPhone 15"
 *               slug: "iphone-15"
 *               image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *               category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *               details: "Latest Apple iPhone with advanced features."
 *               images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *               isFeatured: true
 *               isDeleted: false
 *               created_at: "2025-05-31T12:00:00.000Z"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/product/slug/{slug}:
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
 *         content:
 *           application/json:
 *             example:
 *               id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *               name: "iPhone 15"
 *               slug: "iphone-15"
 *               image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *               category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *               details: "Latest Apple iPhone with advanced features."
 *               images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *               isFeatured: true
 *               isDeleted: false
 *               created_at: "2025-05-31T12:00:00.000Z"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/product/slug/:slug', productController.getProductBySlug);

/**
 * @swagger
 * /api/product/category/{category_id}:
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
 *         content:
 *           application/json:
 *             example:
 *               - id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *                 name: "iPhone 15"
 *                 slug: "iphone-15"
 *                 image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *                 category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *                 details: "Latest Apple iPhone with advanced features."
 *                 images: ["data:image/png;base64,iVBORw0KGgoAAAANS...", "data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *                 isFeatured: true
 *                 isDeleted: false
 *                 created_at: "2025-05-31T12:00:00.000Z"
 *       500:
 *         description: Server error
 */
router.get('/category/:category_id', productController.getProductsByCategory);

/**
 * @swagger
 * /api/product/{id}:
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
 *           example:
 *             name: "iPhone 15 Pro"
 *             image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *             details: "Updated Apple iPhone with more features."
 *             images: ["data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *             isFeatured: true
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             example:
 *               id: "d3c9e0f4-7890-4a23-9fgh-3456789012cd"
 *               name: "iPhone 15 Pro"
 *               slug: "iphone-15"
 *               image: "data:image/png;base64,iVBORw0KGgoAAAANS..."
 *               category_id: "b1a7c8e2-1234-4f56-9abc-1234567890ab"
 *               details: "Updated Apple iPhone with more features."
 *               images: ["data:image/png;base64,iVBORw0KGgoAAAANS..."]
 *               isFeatured: true
 *               isDeleted: false
 *               created_at: "2025-05-31T12:00:00.000Z"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  requireRole(['admin']),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /api/product/{id}:
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
router.delete('/:id', requireRole(['admin']), productController.deleteProduct);

module.exports = router;
