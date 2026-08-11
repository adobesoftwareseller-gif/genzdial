import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
    const {
        items, updateQty, removeFromCart, subtotal, count,
        isDrawerOpen, closeDrawer,
    } = useCart();
    const navigate = useNavigate();

    if (!isDrawerOpen) return null;

    const handleBuyNow = () => {
        closeDrawer();
        navigate('/checkout');
    };

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

                        <div className="cart-drawer-footer">
                            <div className="cart-drawer-subtotal">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
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