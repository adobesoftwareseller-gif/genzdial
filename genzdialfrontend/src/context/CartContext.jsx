import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const raw = JSON.parse(localStorage.getItem('cart') || '[]');
            return raw.map((i) => ({
                _id: i._id,
                name: i.name,
                brand: i.brand,
                price: i.price,
                mrp: i.mrp,
                ogBoxPrice: i.ogBoxPrice || 0,
                image: i.image,
                category: i.category,
                qty: i.qty || 1,
            }));
        } catch {
            return [];
        }
    });

    const [withBox, setWithBox] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart_with_box') || 'false') === true;
        } catch {
            return false;
        }
    });

    const [coupon, setCoupon] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart_coupon') || 'null'); }
        catch { return null; }
    });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    useEffect(() => {
        try {
            if (coupon) localStorage.setItem('cart_coupon', JSON.stringify(coupon));
            else localStorage.removeItem('cart_coupon');
        } catch { /* ignore */ }
    }, [coupon]);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(items));
        } catch (err) {
            console.warn('Cart not persisted to localStorage:', err.message);
        }
    }, [items]);

    useEffect(() => {
        try {
            localStorage.setItem('cart_with_box', JSON.stringify(withBox));
        } catch (err) {
            console.warn('Box option not persisted:', err.message);
        }
    }, [withBox]);

    const slimProduct = (p) => ({
        _id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        mrp: p.mrp,
        ogBoxPrice: p.ogBoxPrice || 0,
        image: p.image,
        category: p.category,
    });

    const addToCart = (product, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === product._id ? { ...i, qty: i.qty + qty } : i
                );
            }
            return [...prev, { ...slimProduct(product), qty }];
        });
        openDrawer();
    };

    const removeFromCart = (id) =>
        setItems((prev) => prev.filter((i) => i._id !== id));

    const updateQty = (id, qty) =>
        setItems((prev) =>
            prev
                .map((i) => (i._id === id ? { ...i, qty: Math.max(0, qty) } : i))
                .filter((i) => i.qty > 0)
        );

    const clearCart = () => {
        setItems([]);
        setWithBox(false);
        setCoupon(null);
    };

    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const boxFee = withBox ? items.reduce((s, i) => s + (Number(i.ogBoxPrice) || 0) * i.qty, 0) : 0;

    const discountBase = subtotal + boxFee;
    const rawDiscount = coupon ? Math.round((discountBase * (coupon.percent || 0)) / 100) : 0;
    const cappedDiscount = coupon && coupon.maxDiscount > 0
        ? Math.min(rawDiscount, coupon.maxDiscount)
        : rawDiscount;
    const discount = Math.min(cappedDiscount, discountBase);

    const applyCoupon = (c) => setCoupon(c);
    const removeCoupon = () => setCoupon(null);

    return (
        <CartContext.Provider
            value={{
                items, addToCart, removeFromCart, updateQty, clearCart,
                count, subtotal,
                withBox, setWithBox, boxFee,
                coupon, applyCoupon, removeCoupon, discount,
                isDrawerOpen, openDrawer, closeDrawer,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);