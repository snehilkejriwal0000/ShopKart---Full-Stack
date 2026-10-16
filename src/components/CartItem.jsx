import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();
    const [busy, setBusy] = useState(false);
    const product = item.product;

    async function changeQty(next) {
        if (next < 1) return; // use the explicit Remove button for quantity 1 -> 0
        if (next > product.stock) return; // never exceed stock
        setBusy(true);
        try {
            await updateQuantity(product._id, next);
        } catch (err) {
            alert(err.response?.data?.message || "Could not update quantity");
        } finally {
            setBusy(false);
        }
    }

    async function handleRemove() {
        setBusy(true);
        try {
            await removeFromCart(product._id);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={styles.row}>
            <img src={product.image} alt={product.name} style={styles.img} />
            <div style={styles.info}>
                <p style={styles.name}>{product.name}</p>
                <p style={styles.price}>₹{product.price.toLocaleString("en-IN")}</p>
                <div style={styles.qtyRow}>
                    <button disabled={busy} onClick={() => changeQty(item.quantity - 1)} style={styles.qtyBtn}>-</button>
                    <span>{item.quantity}</span>
                    <button disabled={busy || item.quantity >= product.stock} onClick={() => changeQty(item.quantity + 1)} style={styles.qtyBtn}>+</button>
                </div>
                <button disabled={busy} onClick={handleRemove} style={styles.removeBtn}>Remove</button>
            </div>
            <div style={styles.lineTotal}>₹{(product.price * item.quantity).toLocaleString("en-IN")}</div>
        </div>
    );
}

const styles = {
    row: { display: "flex", gap: 16, alignItems: "center", borderBottom: "1px solid #eee", padding: "12px 0" },
    img: { width: 72, height: 72, objectFit: "cover", borderRadius: 8, background: "#f4f4f4" },
    info: { flex: 1 },
    name: { margin: 0, fontWeight: 600 },
    price: { margin: "2px 0 8px", color: "#555" },
    qtyRow: { display: "flex", alignItems: "center", gap: 10 },
    qtyBtn: { width: 28, height: 28, borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
    removeBtn: { marginTop: 8, background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13, padding: 0 },
    lineTotal: { fontWeight: 700, minWidth: 90, textAlign: "right" },
};
