import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
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
            await register(form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.wrap}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Create your ShopKart account</h2>
                {error && <p style={styles.error}>{error}</p>}
                <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} style={styles.input} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
                <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} style={styles.input} required minLength={6} />
                <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} style={styles.input} required />
                <button type="submit" disabled={loading} style={styles.btn}>{loading ? "Creating..." : "Register"}</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
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
