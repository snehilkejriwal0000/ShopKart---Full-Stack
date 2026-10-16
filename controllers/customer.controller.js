const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const SALT_ROUNDS = 10;

async function registerCustomer(req, res) {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
        if (existingCustomer) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const customer = await Customer.create({ fullName, email, password: hashedPassword, phone });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
            },
        });
    } catch (err) {
        console.error("registerCustomer error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while registering" });
    }
}

async function loginCustomer(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const customer = await Customer.findOne({ email: email.toLowerCase() }).select("+password");
        if (!customer) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(customer);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "Login successful" });
    } catch (err) {
        console.error("loginCustomer error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while logging in" });
    }
}

async function getMyProfile(req, res) {
    const customer = req.user;
    return res.status(200).json({
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
    });
}

async function logoutCustomer(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "oldPassword and newPassword are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
        }

        const customer = await Customer.findById(req.user._id).select("+password");
        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Old password is incorrect" });
        }

        customer.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await customer.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("changePassword error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong while changing password" });
    }
}

module.exports = { registerCustomer, loginCustomer, getMyProfile, logoutCustomer, changePassword };
