const Product = require("../models/product.model");

// GET /products?search=&category=&minPrice=&maxPrice=
async function getProducts(req, res) {
    try {
        const { search, category, minPrice, maxPrice } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (category) {
            filter.category = category;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, products });
    } catch (err) {
        console.error("getProducts error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while fetching products" });
    }
}

async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, product });
    } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid product id" });
    }
}

// POST /products - simple create endpoint (no admin-role system in this lab series)
async function createProduct(req, res) {
    try {
        const { name, description, price, image, category, stock } = req.body;
        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({ success: false, message: "name, price and stock are required" });
        }
        const product = await Product.create({ name, description, price, image, category, stock });
        return res.status(201).json({ success: true, product });
    } catch (err) {
        console.error("createProduct error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while creating product" });
    }
}

module.exports = { getProducts, getProductById, createProduct };
