import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    async function loadWishlist() {
        setLoading(true);
        try {
            const res = await api.get("/wishlist");
            setWishlist(res.data.wishlist);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWishlist();
    }, []);

    async function handleRemove(productId) {
        await api.delete(`/wishlist/${productId}`);
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
    }

    if (loading) return <p style={{ padding: 24 }}>Loading your wishlist...</p>;

    if (wishlist.length === 0) {
        return <p style={{ padding: 24 }}>Your wishlist is empty. Browse products and save your favorites.</p>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h2>My Wishlist</h2>
            <div style={{ display: "grid", gap: 12 }}>
                {wishlist.map((product) => (
                    <div key={product._id} style={{ display: "flex", gap: 16, alignItems: "center", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                        <img src={product.image} alt={product.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                            <p style={{ margin: 0 }}>₹{product.price.toLocaleString("en-IN")}</p>
                        </div>
                        <button onClick={() => addToCart(product._id)} style={{ padding: "6px 12px" }}>Add to Cart</button>
                        <button onClick={() => handleRemove(product._id)} style={{ padding: "6px 12px", color: "#c0392b" }}>Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
