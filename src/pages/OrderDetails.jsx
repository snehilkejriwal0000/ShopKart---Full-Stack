import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api
            .get(`/orders/${id}`)
            .then((res) => setOrder(res.data.order))
            .catch(() => setError("Order not found"));
    }, [id]);

    if (error) return <p style={{ padding: 24 }}>{error}</p>;
    if (!order) return <p style={{ padding: 24 }}>Loading...</p>;

    return (
        <div style={{ padding: 24, maxWidth: 600 }}>
            <h2>Order #{order._id}</h2>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>

            <h3>Items</h3>
            {order.items.map((item) => (
                <div key={item.product} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
            ))}
            <p style={{ fontWeight: 700, borderTop: "1px solid #ddd", paddingTop: 10 }}>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>

            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
        </div>
    );
}
