const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const productRoutes = require('./product');
const cartRoutes = require('./cart');
const wishlistRoutes = require('./wishlist');
const contactRoutes = require('./contact');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/product', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
