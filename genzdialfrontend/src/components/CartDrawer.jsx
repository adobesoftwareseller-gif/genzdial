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

    // Total OG Box fee for everything currently in the cart, shown regardless
    // of whether the option is ticked (boxFee from context is 0 when untied).
    const rawBoxFee = items.reduce((s, i) => s + (Number(i.ogBoxPrice) || 0) * i.qty, 0);
    const hasBoxOption = rawBoxFee > 0;

    return (
        <div className="cart-drawer-overlay" onClick={closeDrawer}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="cart-drawer-header">
                    <h3>Your Cart ({count})</h3>
                    <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Close