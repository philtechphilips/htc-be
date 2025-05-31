const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { validate, addToWishlistSchema, removeFromWishlistSchema } = require("../middleware/wishlistValidation");
const { requireRole } = require("../middleware/role");

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *         description: Product added to wishlist
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     responses:
 *       200:
 *         description: Wishlist fetched
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
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
 *         description: Product removed from wishlist
 *   put:
 *     summary: Update wishlist item (e.g., note, priority)
 *     tags: [Wishlist]
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
 *               note:
 *                 type: string
 *                 example: "Birthday gift idea"
 *               priority:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Wishlist updated
 */
router.post("/", requireRole(["user", "admin"]), validate(addToWishlistSchema), wishlistController.addToWishlist);
router.get("/:user_id", requireRole(["user", "admin"]), wishlistController.getWishlist);
router.delete("/", requireRole(["user", "admin"]), validate(removeFromWishlistSchema), wishlistController.removeFromWishlist);
router.put("/", requireRole(["user", "admin"]), validate(addToWishlistSchema), wishlistController.updateWishlist);

module.exports = router;
