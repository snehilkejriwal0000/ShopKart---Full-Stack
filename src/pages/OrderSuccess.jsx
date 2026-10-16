import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        api.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
    }, [id]);

    if (!order) return <p style={{ padding: 24 }}>Loading...</p>;

    return (
        <div style={{ padding: 24, maxWidth: 500 }}>
            <h2>✅ Order Placed Successfully</h2>
            <p>Order ID: {order._id}</p>
            <p>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
            <p>Status: {order.status}</p>
            <p>Your order has been saved successfully.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Link to="/orders">View My Orders</Link>
                <Link to="/">Continue Shopping</Link>
            </div>
        </div>
    );
}
