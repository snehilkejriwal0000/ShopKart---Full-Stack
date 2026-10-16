const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// POST /cart/:productId
// If not in cart -> add with quantity 1. If already in cart -> quantity += 1.
async function addToCart(req, res) {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        const existingItem = customer.cart.find((item) => item.product.toString() === productId);

        const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;
        if (nextQuantity > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) of ${product.name} available` });
        }

        if (existingItem) {
            existingItem.quantity = nextQuantity;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();
        await customer.populate("cart.product");

        return res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart });
    } catch (err) {
        console.error("addToCart error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// GET /cart
async function getCart(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate("cart.product");
        return res.status(200).json({ success: true, cart: customer.cart });
    } catch (err) {
        console.error("getCart error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// PATCH /cart/:productId  { quantity }
async function updateCartQuantity(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }
        if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
            return res.status(400).json({ success: false, message: "Quantity must be a number" });
        }
        if (quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) of ${product.name} available` });
        }

        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((i) => i.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        item.quantity = quantity;
        await customer.save();
        await customer.populate("cart.product");

        return res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart });
    } catch (err) {
        console.error("updateCartQuantity error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// DELETE /cart/:productId
async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product id" });
        }

        const customer = await Customer.findById(req.user._id);
        customer.cart = customer.cart.filter((i) => i.product.toString() !== productId);
        await customer.save();
        await customer.populate("cart.product");

        return res.status(200).json({ success: true, message: "Removed from cart", cart: customer.cart });
    } catch (err) {
        console.error("removeFromCart error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
