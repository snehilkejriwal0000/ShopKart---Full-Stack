import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadOrders() {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/orders");
            setOrders(res.data.orders);
        } catch (err) {
            setError("Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) return <p style={{ padding: 24 }}>Loading your orders...</p>;
    if (error) return <div style={{ padding: 24 }}><p>{error}</p><button onClick={loadOrders}>Try Again</button></div>;

    if (orders.length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <p>You have not placed any orders yet.</p>
                <Link to="/">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 700 }}>
            <h2>My Orders</h2>
            {orders.map((order) => (
                <div key={order._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Order #{order._id}</p>
                    <p style={{ margin: "4px 0", color: "#777", fontSize: 13 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.items.map((item) => (
                        <p key={item.product} style={{ margin: 0 }}>{item.name} × {item.quantity}</p>
                    ))}
                    <p style={{ fontWeight: 700, marginTop: 8 }}>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
                    <p>Status: {order.status}</p>
                    <Link to={`/orders/${order._id}`}>View Details</Link>
                </div>
            ))}
        </div>
    );
}
