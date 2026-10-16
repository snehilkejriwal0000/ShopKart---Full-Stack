import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.wrap}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Login to ShopKart</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} required />
                <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Logging in..." : "Login"}</button>
                <p>New to ShopKart? <Link to="/register">Create an account</Link></p>
            </form>
        </div>
    );
}

const styles = {
    wrap: { display: "flex", justifyContent: "center", padding: "60px 20px" },
    form: { width: 360, display: "flex", flexDirection: "column", gap: 10 },
    input: { padding: 10, borderRadius: 6, border: "1px solid #ccc" },
    btn: { padding: 10, borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer" },
    error: { color: "#c0392b", fontSize: 14 },
};
