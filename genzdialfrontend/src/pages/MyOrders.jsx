import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { OrdersSkeleton } from '../components/Skeleton.jsx';

const STATUS_COLORS = {
    placed: '#6b7280',
    confirmed: '#1d4ed8',
    shipped: '#a855f7',
    delivered: '#10b981',
    cancelled: '#b91c1c',
};

export default function MyOrders() {
    const { user, openLogin } = useUserAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        api.get('/orders/mine')
            .then((r) => setOrders(r.data))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <section className="container section">
                <div className="empty">
                    <h2>Please log in to view your orders</h2>
                    <button className="btn-primary" onClick={openLogin}>Login</button>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="container section">
                <h2>My Orders</h2>
                <div style={{ marginTop: 20 }}>
                    <OrdersSkeleton count={3} />
                </div>
            </section>
        );
    }

    if (orders.length === 0) {
        return (
            <section className="container section">
                <div className="empty">
                    <h2>No orders yet 🛍️</h2>
                    <p>When you place an order, it will show up here.</p>
                    <Link to="/shop" className="btn-primary">Browse Watches</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container section">
            <h2>My Orders ({orders.length})</h2>
            <div className="my-orders" style={{ marginTop: 20 }}>
                {orders.map((o) => (
                    <div className="my-order" key={o._id}>
                        <div className="mo-head" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                            <div>
                                <div className="mo-id">Order #{o._id.slice(-8).toUpperCase()}</div>
                                <div className="mo-meta">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                            <div>
                                <div className="mo-meta">{o.items?.length || 0} item(s)</div>
                                <div className="mo-total">₹{o.total}</div>
                            </div>
                            <span className="mo-status" style={{ background: STATUS_COLORS[o.status] || '#6b7280' }}>
                                {o.status}
                            </span>
                        </div>
                        {expanded === o._id && (
                            <div className="mo-body">
                                <div className="mo-cols">
                                    <div>
                                        <h4>Items</h4>
                                        {o.items?.map((it, idx) => (
                                            <div key={idx} className="mo-item">
                                                <img src={it.image} alt="" />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                                                    <div className="mo-meta">{it.brand} · Qty {it.qty}</div>
                                                </div>
                                                <div>₹{it.price * it.qty}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h4>Shipping Address</h4>
                                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                                            <strong>{o.address?.fullName}</strong><br />
                                            {o.address?.line1}{o.address?.line2 ? `, ${o.address.line2}` : ''}<br />
                                            {o.address?.city}, {o.address?.state} {o.address?.pincode}<br />
                                            {o.address?.country}<br />
                                            📞 {o.address?.phone}
                                        </p>
                                        <h4 style={{ marginTop: 14 }}>Payment</h4>
                                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                                            Subtotal: ₹{o.subtotal}<br />
                                            Shipping: {o.shipping === 0 ? 'FREE' : `₹${o.shipping}`}<br />
                                            <strong>Total: ₹{o.total}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
