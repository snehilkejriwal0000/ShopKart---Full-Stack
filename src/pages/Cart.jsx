import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

export default function Cart() {
    const { cartItems, loading, error, subtotal, itemCount, refreshCart } = useCart();
    const navigate = useNavigate();

    if (loading) return <p style={{ padding: 24 }}>Loading your cart...</p>;

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <p>{error}</p>
                <button onClick={refreshCart}>Try Again</button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <h2>Your cart is empty 🛒</h2>
                <p>Looks like you haven't added anything yet.</p>
                <Link to="/">Browse Products</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 700 }}>
            <h2>My Cart</h2>
            {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
            ))}

            <div style={{ marginTop: 24, borderTop: "2px solid #111", paddingTop: 16 }}>
                <h3>Order Summary</h3>
                <p>Items: {itemCount}</p>
                <p style={{ fontWeight: 700, fontSize: 18 }}>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                <button
                    onClick={() => navigate("/checkout")}
                    style={{ width: "100%", padding: 12, borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 15 }}
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}
