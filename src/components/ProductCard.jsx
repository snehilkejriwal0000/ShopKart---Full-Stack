import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, isWishlisted, onWishlistToggle }) {
    const { cartItems, addToCart } = useCart();
    const [adding, setAdding] = useState(false);
    const [wishlisting, setWishlisting] = useState(false);

    const inCart = cartItems.some((item) => item.product?._id === product._id);

    async function handleAdd() {
        setAdding(true);
        try {
            await addToCart(product._id);
        } catch (err) {
            alert(err.response?.data?.message || "Could not add to cart");
        } finally {
            setAdding(false);
        }
    }

    async function handleWishlistToggle() {
        setWishlisting(true);
        try {
            await onWishlistToggle(product._id, !isWishlisted);
        } catch (err) {
            alert(err.response?.data?.message || "Could not update wishlist");
        } finally {
            setWishlisting(false);
        }
    }

    return (
        <div style={styles.card}>
            <div style={styles.imgWrap}>
                <img src={product.image} alt={product.name} style={styles.img} />
                <button
                    onClick={handleWishlistToggle}
                    disabled={wishlisting}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    style={styles.heartBtn}
                >
                    {isWishlisted ? "❤️" : "🤍"}
                </button>
            </div>
            <h3 style={styles.name}>{product.name}</h3>
            <p style={styles.price}>₹{product.price.toLocaleString("en-IN")}</p>
            <p style={styles.stock}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
            <button
                onClick={handleAdd}
                disabled={adding || product.stock === 0}
                style={styles.btn}
            >
                {adding ? "Adding..." : inCart ? "Add Another" : "Add to Cart"}
            </button>
        </div>
    );
}

const styles = {
    card: { border: "1px solid #e2e2e2", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6 },
    imgWrap: { position: "relative" },
    img: { width: "100%", height: 140, objectFit: "cover", borderRadius: 8, background: "#f4f4f4", display: "block" },
    heartBtn: { position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14 },
    name: { fontSize: 15, margin: "4px 0 0" },
    price: { fontWeight: 700, margin: 0 },
    stock: { fontSize: 12, color: "#777", margin: 0 },
    btn: { marginTop: 8, padding: "8px 0", borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer" },
};