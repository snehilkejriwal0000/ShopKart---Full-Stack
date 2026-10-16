const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

async function addToWishlist(req, res) {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        const alreadyIn = customer.wishlist.some((id) => id.toString() === productId);
        if (!alreadyIn) {
            customer.wishlist.push(productId);
            await customer.save();
        }

        return res.status(200).json({ success: true, message: "Wishlist updated", wishlist: customer.wishlist });
    } catch (err) {
        console.error("addToWishlist error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

async function getWishlist(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate("wishlist");
        return res.status(200).json({ success: true, wishlist: customer.wishlist });
    } catch (err) {
        console.error("getWishlist error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);
        customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
        await customer.save();
        return res.status(200).json({ success: true, message: "Removed from wishlist", wishlist: customer.wishlist });
    } catch (err) {
        console.error("removeFromWishlist error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
