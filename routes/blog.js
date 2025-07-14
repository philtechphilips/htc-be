const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireRole } = require('../middleware/role');

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured_image:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       400:
 *         description: A blog post with this title already exists
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all blogs (admin only)
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blogs fetched successfully
 *       500:
 *         description: Server error
 */
router.post('/', requireRole(['admin']), blogController.createBlog);
router.get('/', requireRole(['admin']), blogController.getAllBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post fetched successfully
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update blog post
 *     tags: [Blogs]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured_image:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete blog post
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', requireRole(['admin']), blogController.getBlogById);
router.put('/:id', requireRole(['admin']), blogController.updateBlog);
router.delete('/:id', requireRole(['admin']), blogController.deleteBlog);

/**
 * @swagger
 * /api/blogs/public/published:
 *   get:
 *     summary: Get published blogs (public)
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Published blogs fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/public/published', blogController.getPublishedBlogs);

/**
 * @swagger
 * /api/blogs/public/{slug}:
 *   get:
 *     summary: Get blog by slug (public)
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post fetched successfully
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.get('/public/:slug', blogController.getBlogBySlug);

module.exports = router;
