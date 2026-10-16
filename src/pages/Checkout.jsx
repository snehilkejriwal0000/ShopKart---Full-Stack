import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const emptyForm = { fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" };

export default function Checkout() {
    const { cartItems, subtotal, itemCount, clearCartLocally } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // A user must not be able to land here with nothing to buy
    if (cartItems.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function validate() {
        const errors = {};
        for (const key of Object.keys(emptyForm)) {
            if (!form[key] || !form[key].trim()) {
                errors[key] = "This field is required";
            }
        }
        if (form.phone && !/^\d{10}$/.test(form.phone.trim())) {
            errors.phone = "Phone must be a valid 10-digit number";
        }
        if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
            errors.pincode = "Pincode must contain 6 digits";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }

    async function verifyPayment(payload) {
        const res = await api.post("/orders/verify-payment", payload);
        clearCartLocally(); // instant navbar update, no waiting on a refetch
        navigate(`/order-success/${res.data.order._id}`);
    }

    async function handlePlaceOrder(e) {
        e.preventDefault();
        setFormError("");

        if (!validate()) return; // don't call the backend on bad client-side data

        setSubmitting(true);
        try {
            const { data } = await api.post("/orders/create-payment-order", { shippingAddress: form });

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setFormError("Could not load the payment gateway. Check your connection and try again.");
                setSubmitting(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            shopKartOrderId: data.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                    } catch (err) {
                        setFormError(err.response?.data?.message || "Payment verification failed.");
                    }
                },
                prefill: { name: form.fullName, contact: form.phone },
                theme: { color: "#111111" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on("payment.failed", function () {
                setFormError("Payment failed. Your cart has not been cleared — please try again.");
            });
            paymentObject.open();
        } catch (err) {
            setFormError(err.response?.data?.message || "Could not start checkout.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ padding: 24, maxWidth: 700 }}>
            <h2>Checkout</h2>
            {formError && <p style={{ color: "#c0392b" }}>{formError}</p>}

            <form onSubmit={handlePlaceOrder}>
                <h3>Shipping Details</h3>
                {[
                    ["fullName", "Full Name"],
                    ["phone", "Phone"],
                    ["addressLine1", "Address"],
                    ["city", "City"],
                    ["state", "State"],
                    ["pincode", "Pincode"],
                ].map(([field, label]) => (
                    <div key={field} style={{ marginBottom: 10 }}>
                        <input
                            name={field}
                            placeholder={label}
                            value={form[field]}
                            onChange={handleChange}
                            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
                        />
                        {fieldErrors[field] && <p style={{ color: "#c0392b", fontSize: 12, margin: "4px 0 0" }}>{fieldErrors[field]}</p>}
                    </div>
                ))}

                <h3 style={{ marginTop: 24 }}>Order Summary</h3>
                {cartItems.map((item) => (
                    <div key={item.product._id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 10, borderTop: "1px solid #ddd", paddingTop: 10 }}>
                    <span>Total ({itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", marginTop: 20, padding: 12, borderRadius: 6, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 15 }}
                >
                    {submitting ? "Processing..." : "Place Order"}
                </button>
            </form>
        </div>
    );
}
