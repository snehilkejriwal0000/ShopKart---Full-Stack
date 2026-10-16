const jwt = require("jsonwebtoken");

function generateToken(customer) {
    const payload = { id: customer._id };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY || "1d",
    });
}

module.exports = generateToken;
