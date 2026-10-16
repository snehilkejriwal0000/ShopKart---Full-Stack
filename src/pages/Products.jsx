import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState(new Set()); // product IDs currently in the user's wishlist
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadProducts(query = "") {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/products", { params: query ? { search: query } : {} });
            setProducts(res.data.products);
        } catch (err) {
            setError("Unable to load products.");
        } finally {
            setLoading(false);
        }
    }

    // Load the user's actual saved wishlist once, so hearts reflect real
    // server state instead of resetting on every page visit.
    async function loadWishlistIds() {
        try {
            const res = await api.get("/wishlist");
            setWishlistIds(new Set(res.data.wishlist.map((p) => p._id)));
        } catch (err) {
            // non-fatal — hearts just default to empty if this fails
        }
    }

    useEffect(() => {
        loadProducts();
        loadWishlistIds();
    }, []);

    function handleSearchSubmit(e) {
        e.preventDefault();
        loadProducts(search);
    }

    async function handleWishlistToggle(productId, nextState) {
        if (nextState) {
            await api.post(`/wishlist/${productId}`);
        } else {
            await api.delete(`/wishlist/${productId}`);
        }
        setWishlistIds((prev) => {
            const next = new Set(prev);
            if (nextState) next.add(productId);
            else next.delete(productId);
            return next;
        });
    }

    return (
        <div style={{ padding: 24 }}>
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: 20, display: "flex", gap: 8 }}>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: "0 16px", borderRadius: 6, border: "none", background: "#111", color: "#fff" }}>Search</button>
            </form>

            {loading && <p>Loading products...</p>}
            {error && <p>{error} <button onClick={() => loadProducts(search)}>Try Again</button></p>}
            {!loading && !error && products.length === 0 && <p>No products found.</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {products.map((p) => (
                    <ProductCard
                        key={p._id}
                        product={p}
                        isWishlisted={wishlistIds.has(p._id)}
                        onWishlistToggle={handleWishlistToggle}
                    />
                ))}
            </div>
        </div>
    );
}