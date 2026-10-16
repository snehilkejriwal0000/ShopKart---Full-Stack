const express = require("express");
const router = express.Router();

const { addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/wishlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware); // every wishlist route requires login

router.post("/:productId", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
