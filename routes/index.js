const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const adminRoutes = require("./admin");
const productRoutes = require("./product");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/product", productRoutes);

module.exports = router;
