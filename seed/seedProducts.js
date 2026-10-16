// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const sampleProducts = [
    { name: "Mechanical Keyboard", description: "Tactile RGB mechanical keyboard", price: 2999, stock: 10, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500" },
    { name: "Wireless Mouse", description: "Ergonomic wireless mouse", price: 1499, stock: 25, category: "Electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500" },
    { name: "USB-C Hub", description: "7-in-1 USB-C hub", price: 1999, stock: 15, category: "Electronics", image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500" },
    { name: "Noise Cancelling Headphones", description: "Over-ear ANC headphones", price: 7999, stock: 8, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
    { name: "27-inch Monitor", description: "QHD IPS monitor", price: 18999, stock: 5, category: "Electronics", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500" },
    { name: "Laptop Stand", description: "Adjustable aluminium laptop stand", price: 1299, stock: 20, category: "Accessories", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500" },
    { name: "Webcam 1080p", description: "Full HD webcam with mic", price: 2499, stock: 12, category: "Electronics", image: "https://images.unsplash.com/photo-1587826080692-f439465c4c90?w=500" },
    { name: "Desk Lamp", description: "LED desk lamp with dimmer", price: 899, stock: 30, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB, seeding products...");

        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);

        console.log(`Seeded ${sampleProducts.length} products.`);
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
