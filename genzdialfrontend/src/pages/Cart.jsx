import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
);

export default function Cart() {
    const {
        items, updateQty, removeFromCart, subtotal, clearCart,
        withBox, setWithBox, boxFee, BOX_FEE,
        coupon, applyCoupon, removeCoupon, discount,
    } = useCart();
    const { requireAuth } = useUserAuth();
    const navigate = useNavigate();
    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const total = Math.max(0, subtotal + shipping + boxFee - discount);

    const [couponInput, setCouponInput] = useState(coupon?.code || '');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponInfo, setCouponInfo] = useState('');

    const handleApplyCoupon = async (e) => {
        e?.preventDefault?.();
        const code = couponInput.trim().toUpperCase();
        if (!code) { setCouponError('Enter a coupon code'); return; }
        setCouponLoading(true);
        setCouponError('');
        setCouponInfo('');
        try {
            const { data } = await api.post('/coupons/validate', {
                code,
                subtotal: subtotal + boxFee,
            });
            applyCoupon({
                code: data.code,
                percent: data.percent,
                maxDiscount: data.maxDiscount || 0,
            });
            setCouponInput(data.code);
            setCouponInfo(`${data.percent}% off applied`);
        } catch (err) {
            removeCoupon();
            setCouponError(err.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponInput('');
        setCouponInfo('');
        setCouponError('');
    };

    if (items.length === 0) {
        return (
            <section className="container section">
                <div className="empty">
                    <h2>Your cart is empty 🛒</h2>
                    <p>Find a timepiece you love.</p>
                    <Link to="/shop" className="btn-primary">Browse Watches</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container section">
            <h2>Your Cart ({items.length})</h2>
            <div className="cart-grid" style={{ marginTop: 20 }}>
                <div>
                    {items.map((i) => (
                        <div className="cart-item" key={i._id}>
                            <img src={i.image} alt={i.name} />
                            <div>
                                <div style={{ fontWeight: 600, lineHeight: '25px', marginBottom: '10px' }}>{i.name}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{i.brand}</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: '12px' }}>
                                    <div className="qty">
                                        <button onClick={() => updateQty(i._id, i.qty - 1)}>−</button>
                                        <span>{i.qty}</span>
                                        <button onClick={() => updateQty(i._id, i.qty + 1)}>+</button>
                                    </div>
                                    <button className="cart-trash" onClick={() => removeFromCart(i._id)} aria-label="Remove item" title="Remove">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontWeight: 600 }}>₹{i.price * i.qty}</div>
                        </div>
                    ))}
                    <button className="link-remove" onClick={clearCart}>Clear cart</button>
                </div>

                <div className="summary">
                    <h3 style={{ marginTop: 0, fontWeight: 600 }}>Order Summary</h3>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={withBox}
                            onChange={(e) => setWithBox(e.target.checked)}
                            style={{ marginTop: 3 }}
                        />
                        <span style={{ fontSize: 14 }}>
                            With original box
                            <span style={{ display: 'block', color: 'var(--muted)', fontSize: 12, marginTop: '5px' }}>
                                Adds ₹{BOX_FEE} per watch to your order
                            </span>
                        </span>
                    </label>
                    <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    {withBox && (
                        <div className="row"><span>Original box</span><span>₹{boxFee}</span></div>
                    )}

                    <div className="coupon-box">
                        {coupon ? (
                            <div className="coupon-applied">
                                <div>
                                    <strong>{coupon.code}</strong>{' '}
                                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                                        ({coupon.percent}% off)
                                    </span>
                                </div>
                                <button type="button" className="link-remove" onClick={handleRemoveCoupon}>
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <form className="coupon-form" onSubmit={handleApplyCoupon}>
                                <input
                                    type="text"
                                    placeholder="Coupon code"
                                    value={couponInput}
                                    maxLength={32}
                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                />
                                <button type="submit" disabled={couponLoading}>
                                    {couponLoading ? '…' : 'APPLY'}
                                </button>
                            </form>
                        )}
                        {couponError && <div className="login-error" style={{ marginTop: 6 }}>{couponError}</div>}
                        {!couponError && couponInfo && (
                            <div className="login-info" style={{ marginTop: 6 }}>{couponInfo}</div>
                        )}
                    </div>

                    {discount > 0 && (
                        <div className="row"><span>Discount</span><span>− ₹{discount}</span></div>
                    )}
                    <div className="row total"><span>Total</span><span>₹{total}</span></div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => requireAuth(() => navigate('/checkout'))}>
                        Proceed to Checkout →
                    </button>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                        Free shipping on orders over ₹1500. Secure checkout.
                    </p>
                </div>
            </div>
        </section>
    );
}
