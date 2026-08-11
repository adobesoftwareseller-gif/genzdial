import { useEffect, useState } from 'react';
import api from '../api.js';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/admin');
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const setStatus = async (id, status) => {
        await api.patch(`/orders/admin/${id}`, { status });
        setOrders((o) => o.map((x) => (x._id === id ? { ...x, status } : x)));
    };

    if (loading) return <div className="admin-page"><h2>Orders</h2><p>Loading…</p></div>;

    return (
        <div className="admin-page">
            <h2>Orders ({orders.length})</h2>
            {orders.length === 0 && <p>No orders yet.</p>}
            <div className="admin-orders">
                {orders.map((o) => (
                    <div className="admin-order-card" key={o._id}>
                        <div className="aoc-head" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                            <div>
                                <div className="aoc-id">#{o._id.slice(-8).toUpperCase()}</div>
                                <div className="aoc-meta">{new Date(o.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="aoc-name">{o.userName || '—'}</div>
                                <div className="aoc-meta">{o.userPhone || '—'}</div>
                            </div>
                            <div>
                                <div className="aoc-meta">{o.items?.length || 0} item(s)</div>
                                <div className="aoc-total">₹{o.total}</div>
                            </div>
                            <select value={o.status} onClick={(e) => e.stopPropagation()} onChange={(e) => setStatus(o._id, e.target.value)}>
                                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {expanded === o._id && (
                            <div className="aoc-body">
                                <div className="aoc-cols">
                                    <div>
                                        <h4>Items</h4>
                                        {o.items?.map((it, idx) => (
                                            <div key={idx} className="aoc-item">
                                                <img src={it.image} alt="" />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                                                    <div className="aoc-meta">{it.brand} · Qty {it.qty}</div>
                                                </div>
                                                <div>₹{it.price * it.qty}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h4>Shipping Address</h4>
                                        <p style={{ margin: 0 }}>
                                            <strong>{o.address?.fullName}</strong><br />
                                            {o.address?.line1}{o.address?.line2 ? `, ${o.address.line2}` : ''}<br />
                                            {o.address?.city}, {o.address?.state} {o.address?.pincode}<br />
                                            {o.address?.country}<br />
                                            📞 {o.address?.phone || o.userPhone}
                                        </p>
                                        <h4 style={{ marginTop: 14 }}>Payment</h4>
                                        <p style={{ margin: 0 }}>
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
        </div>
    );
}
