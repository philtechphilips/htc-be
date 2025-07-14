const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const { validate, registerSchema, loginSchema } = require('../middleware/authValidation');
const { requireRole } = require('../middleware/role');

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Admin
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: adminpassword
 *     responses:
 *       201:
 *         description: Admin registered
 *       400:
 *         description: Admin already exists
 *       500:
 *         description: Server error
 */
router.post('/register', validate(registerSchema), adminController.register);

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login as admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: adminpassword
 *     responses:
 *       200:
 *         description: Admin login successful
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', validate(loginSchema), adminController.login);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard stats fetched
 *       500:
 *         description: Server error
 */
router.get('/dashboard/stats', requireRole(['admin']), adminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/recent-activity:
 *   get:
 *     summary: Get recent cart activity for dashboard
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Recent activity fetched
 *       500:
 *         description: Server error
 */
router.get(
  '/dashboard/recent-activity',
  requireRole(['admin']),
  adminController.getRecentCartActivity
);

/**
 * @swagger
 * /api/admin/dashboard/product-analytics:
 *   get:
 *     summary: Get product analytics for dashboard
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Product analytics fetched
 *       500:
 *         description: Server error
 */
router.get(
  '/dashboard/product-analytics',
  requireRole(['admin']),
  adminController.getProductAnalytics
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Users fetched
 *       500:
 *         description: Server error
 */
router.get('/users', requireRole(['admin']), adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               street:
 *                 type: string
 *               apartment:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', requireRole(['admin']), adminController.getUserById);
router.put('/users/:id', requireRole(['admin']), adminController.updateUser);
router.delete('/users/:id', requireRole(['admin']), adminController.deleteUser);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/categories/:id', requireRole(['admin']), productController.updateCategory);

module.exports = router;
