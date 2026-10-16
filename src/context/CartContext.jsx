import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/**
 * Single shared source of truth for cart state (Lab 05, Task 6).
 * Navbar, ProductCard and the Cart page all read from here instead of
 * each fetching/storing their own copy — that's what keeps "Cart (3)"
 * in the navbar always matching what the Cart page actually shows.
 */
export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/cart");
            setCartItems(res.data.cart);
        } catch (err) {
            setError("Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load the cart whenever the logged-in user changes (login/logout/refresh)
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    async function addToCart(productId) {
        const res = await api.post(`/cart/${productId}`);
        setCartItems(res.data.cart);
    }

    async function updateQuantity(productId, quantity) {
        const res = await api.patch(`/cart/${productId}`, { quantity });
        setCartItems(res.data.cart);
    }

    async function removeFromCart(productId) {
        const res = await api.delete(`/cart/${productId}`);
        setCartItems(res.data.cart);
    }

    function clearCartLocally() {
        // Called right after a verified payment — avoids waiting on a
        // network round-trip just to zero out the navbar count.
        setCartItems([]);
    }

    // Derived values — never stored, always computed from cartItems (Lab 05, section 15)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                error,
                subtotal,
                itemCount,
                addToCart,
                updateQuantity,
                removeFromCart,
                refreshCart,
                clearCartLocally,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
