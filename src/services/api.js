import axios from "axios";

// withCredentials is what lets the browser send/receive the HttpOnly
// "token" cookie set by the backend on login — without this, every
// authenticated request would silently fail with 401.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
});

export default api;
