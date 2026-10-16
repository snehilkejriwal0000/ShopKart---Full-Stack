const express = require("express");
const router = express.Router();

const { getProducts, getProductById, createProduct } = require("../controllers/product.controller");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct); // open for seeding/demo purposes in this lab series

module.exports = router;
