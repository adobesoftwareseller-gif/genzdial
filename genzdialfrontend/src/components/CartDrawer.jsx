import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
    const {
        items, updateQty, removeFromCart, subtotal, count,
        withBox, setWithBox, boxFee,
        isDrawerOpen, closeDrawer,
    } = useCart();
    const navigate = useNavigate();

    if (!isDrawerOpen) return null;

    const handleBuyNow = () => {
        closeDrawer();
        navigate('/checkout');
    };

    const rawBoxFee = items.reduce((s, i) => s + (Number(i.ogBoxPrice) || 0) * i.qty, 0);
    const hasBoxOption = rawBoxFee > 0;

    return (
        <div className="cart-drawer-overlay" onClick={closeDrawer}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="cart-drawer-header">
                    <h3>Your Cart ({count})</h3>
                    <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart">×</button>
                </div>

                {items.length === 0 ? (
                    <div className="cart-drawer-empty">
                        <p>Your cart is empty.</p>
                        <button className="btn-primary" onClick={closeDrawer}>Continue Shopping</button>
                    </div>
                ) : (
                    <>
                        <div className="cart-drawer-items">
                            {items.map((item) => (
                                <div className="cart-drawer-item" key={item._id}>
                                    <img src={item.image} alt={item.name} />
                                    <div className="cart-drawer-item-info">
                                        <p className="cart-drawer-item-name">{item.name}</p>
                                        {item.brand && <p className="cart-drawer-item-brand">{item.brand}</p>}
                                        <div className="cart-drawer-qty">
                                            <button onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="cart-drawer-item-right">
                                        <span className="cart-drawer-item-price">₹{item.price * item.qty}</span>
                                        <button
                                            className="cart-drawer-remove"
                                            onClick={() => removeFromCart(item._id)}
                                            aria-label="Remove item"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasBoxOption && (
                            <div
                                className="cart-drawer-og-box"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    margin: '0 16px 12px',
                                    background: '#f8f9fa',
                                    border: '1px solid #d5d9d9',
                                    borderRadius: '8px',
                                }}
                            >
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={withBox}
                                        onChange={(e) => setWithBox(e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }}
                                    />
                                    <span>
                                        <strong>OG Box</strong>
                                        <div style={{ fontSize: '12px', color: '#565959' }}>Include the OG Box for your item(s)</div>
                                    </span>
                                </label>
                                <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>+₹{rawBoxFee}</span>
                            </div>
                        )}

                        <div className="cart-drawer-footer">
                            <div className="cart-drawer-subtotal">
                                <span>Subtotal</span>
                                <span>₹{subtotal + boxFee}</span>
                            </div>
                            <button className="btn-primary cart-drawer-buynow" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                            <Link to="/cart" className="cart-drawer-viewcart" onClick={closeDrawer}>
                                View Full Cart
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}