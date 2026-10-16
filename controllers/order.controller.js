const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function validateShippingAddress(addr) {
    if (!addr) return "Shipping address is required";
    const { fullName, phone, addressLine1, city, state, pincode } = addr;

    const fields = { fullName, phone, addressLine1, city, state, pincode };
    for (const [key, value] of Object.entries(fields)) {
        if (!value || !String(value).trim()) {
            return `${key} is required`;
        }
    }
    if (!/^\d{10}$/.test(phone.trim())) {
        return "Phone must be a valid 10-digit number";
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
        return "Pincode must contain 6 digits";
    }
    return null;
}

// POST /orders/create-payment-order
// Validates cart + stock + prices on the SERVER, creates a PENDING_PAYMENT
// ShopKart order, then creates a matching Razorpay order.
async function createPaymentOrder(req, res) {
    try {
        const { shippingAddress } = req.body;

        const addressError = validateShippingAddress(shippingAddress);
        if (addressError) {
            return res.status(400).json({ success: false, message: addressError });
        }

        const customer = await Customer.findById(req.user._id).populate("cart.product");

        if (!customer.cart.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        // Re-validate every item against LATEST product data (never trust the cart blindly)
        const items = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = cartItem.product;
            if (!product) {
                return res.status(400).json({ success: false, message: "One of the products in your cart no longer exists" });
            }
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image,
            });

            totalAmount += product.price * cartItem.quantity;
        }

        // 1. Create the pending ShopKart order first
        const shopKartOrder = await Order.create({
            user: customer._id,
            items,
            shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        // 2. Create the matching Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString(),
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("createPaymentOrder error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while creating the order" });
    }
}

// POST /orders/verify-payment
async function verifyPayment(req, res) {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid order id" });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not your order" });
        }

        // Use the Razorpay order id WE stored, never trust the one the browser sends alone
        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature || order.razorpayOrderId !== razorpay_order_id) {
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Only now, after verified payment, clear the user's cart
        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        return res.status(200).json({ success: true, message: "Payment verified", order });
    } catch (err) {
        console.error("verifyPayment error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while verifying payment" });
    }
}

// GET /orders
async function getMyOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (err) {
        console.error("getMyOrders error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

// GET /orders/:id
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid order id" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not your order" });
        }

        return res.status(200).json({ success: true, order });
    } catch (err) {
        console.error("getOrderById error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

module.exports = { createPaymentOrder, verifyPayment, getMyOrders, getOrderById };
