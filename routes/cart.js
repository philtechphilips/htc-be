const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { validate, addToCartSchema, removeFromCartSchema } = require('../middleware/cartValidation');
const { requireRole } = require('../middleware/role');

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "product-uuid"
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart fetched
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id]
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "product-uuid"
 *     responses:
 *       200:
 *         description: Product removed from cart
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: "product-uuid"
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart updated
 * /api/cart/checkout:
 *   post:
 *     summary: Checkout cart and send order to admin email
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Checkout successful
 *       400:
 *         description: Cart is empty
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  requireRole(['user', 'admin']),
  validate(addToCartSchema),
  cartController.addToCart
);
router.get('/', requireRole(['user', 'admin']), cartController.getCart);
router.delete(
  '/',
  requireRole(['user', 'admin']),
  validate(removeFromCartSchema),
  cartController.removeFromCart
);
router.put(
  '/',
  requireRole(['user', 'admin']),
  validate(addToCartSchema),
  cartController.updateCart
);
router.post('/checkout', requireRole(['user', 'admin']), cartController.checkout);

module.exports = router;
