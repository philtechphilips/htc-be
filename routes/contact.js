const express = require('express');
const router = express.Router();
const { contactUs } = require('../controllers/contactController');
const { contactUsSchema } = require('../middleware/contactValidation');
const Joi = require('joi');

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Send a contact message
 *     description: Allows users to send a message to the admin via the contact form.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               message:
 *                 type: string
 *                 example: Hello, I have a question about your service.
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Message sent successfully.
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "'email' is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Server error
 */

// Validation middleware
function validateContactUs(req, res, next) {
  const { error } = contactUsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error.details[0].message });
  }
  next();
}

router.post('/', validateContactUs, contactUs);

module.exports = router;
