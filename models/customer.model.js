const mongoose = require("mongoose");

/**
 * The "Customer" collection is ShopKart's User model.
 * Labs 03-05 extend it with wishlist + cart so an authenticated
 * customer's saved products and in-progress cart live on their
 * own document (one source of truth per user).
 */
const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false, // never returned unless explicitly requested with .select("+password")
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },

    // Lab 04 — Wishlist: just references, no extra data per item
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],

    // Lab 05 — Cart: reference + quantity (quantity is the one thing
    // a wishlist entry doesn't need but a cart entry does)
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
