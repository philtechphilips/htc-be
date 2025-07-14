const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireRole } = require('../middleware/role');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - firstName
 *               - lastName
 *               - email
 *               - cart
 *             properties:
 *               userId:
 *                 type: string
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
 *               apartment:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Cart is empty
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       500:
 *         description: Server error
 */
router.post('/', orderController.createOrder);
router.get('/', requireRole(['admin']), orderController.getAllOrders);

// User-specific routes
router.get('/user/orders', requireRole(['admin', 'user']), orderController.getUserOrders);
router.get('/user/orders/:id', requireRole(['admin', 'user']), orderController.getUserOrderById);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *               payment_status:
 *                 type: string
 *                 enum: [pending, paid, refunded]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', requireRole(['admin']), orderController.getOrderById);
router.put('/:id', requireRole(['admin']), orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/stats/overview:
 *   get:
 *     summary: Get order statistics
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Order statistics fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/stats/overview', requireRole(['admin']), orderController.getOrderStats);

module.exports = router;
