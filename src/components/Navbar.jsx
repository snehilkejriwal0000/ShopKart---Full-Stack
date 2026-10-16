import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.brand}>ShopKart</Link>
            <div style={styles.links}>
                {user ? (
                    <>
                        <Link to="/" style={styles.link}>Products</Link>
                        <Link to="/wishlist" style={styles.link}>Wishlist</Link>
                        <Link to="/cart" style={styles.link}>Cart ({itemCount})</Link>
                        <Link to="/orders" style={styles.link}>My Orders</Link>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #e2e2e2", background: "#fff" },
    brand: { fontWeight: 700, fontSize: 20, color: "#111", textDecoration: "none" },
    links: { display: "flex", gap: 18, alignItems: "center" },
    link: { textDecoration: "none", color: "#333", fontSize: 14 },
    logoutBtn: { background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 14 },
};
