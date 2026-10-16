import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while we check for an existing session

    // On first load, ask the backend "am I logged in?" using the cookie
    // the browser already carries (if any). This is what makes a page
    // refresh keep the user logged in instead of bouncing to /login.
    useEffect(() => {
        api
            .get("/customers/me")
            .then((res) => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function register({ fullName, email, password, phone }) {
        await api.post("/customers/register", { fullName, email, password, phone });
    }

    async function login({ email, password }) {
        await api.post("/customers/login", { email, password });
        const res = await api.get("/customers/me");
        setUser(res.data);
    }

    async function logout() {
        await api.post("/customers/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
