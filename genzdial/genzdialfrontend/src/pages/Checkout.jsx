import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { assetUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';

// Razorpay load function
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const cart = useCart();
    const { user } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const buyNow = location.state?.buyNow || null;
    const items = buyNow ? [buyNow] : cart.items;
    const subtotal = buyNow ? buyNow.price * buyNow.qty : cart.subtotal;
    const withBox = buyNow ? false : cart.withBox;
    const boxFee = buyNow ? 0 : cart.boxFee;
    
    const [appliedCoupon, setAppliedCoupon] = useState(buyNow ? null : cart.coupon);
    const discount = appliedCoupon ? appliedCoupon.discount || 0 : (buyNow ? 0 : cart.discount);

    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const total = Math.max(0, subtotal + shipping + boxFee - discount);

    const [step, setStep] = useState('address'); 
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    // Payment Selection State (Sirf UI Trust ke liye)
    const [selectedMethod, setSelectedMethod] = useState('gpay');
    
    // Promo Code States
    const [showPromo, setShowPromo] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [promoMessage, setPromoMessage] = useState('');
    const [verifyingPromo, setVerifyingPromo] = useState(false);

    useEffect(() => {
        if (items.length === 0 && step !== 'done') navigate('/cart');
    }, [items, step, navigate]);

    const submitAddress = (e) => {
        e.preventDefault();
        setError('');
        const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
        for (const k of required) {
            if (!String(address[k] || '').trim()) {
                setError('Please fill all required fields');
                return;
            }
        }
        if (address.phone.replace(/\D/g, '').length !== 10) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        if (address.pincode.replace(/\D/g, '').length !== 6) {
            setError('Enter a valid 6-digit pincode');
            return;
        }
        setStep('pay');
    };

    // SECURE: Backend API verified coupon system
    const handleApplyPromo = async () => {
        if(!promoInput.trim()) {
            setPromoMessage('Please enter a valid code');
            return;
        }
        setVerifyingPromo(true);
        setPromoMessage('');
        try {
            // Ye backend setup hone ke baad chalega
            const { data } = await api.post('/coupons/validate', { code: promoInput, subtotal });
            setAppliedCoupon({ code: data.code, discount: data.discount });
            setPromoMessage(`Coupon applied! Discount: ₹${data.discount}`);
        } catch (err) {
            setPromoMessage(err.response?.data?.message || 'Invalid or expired coupon');
            setAppliedCoupon(null);
        } finally {
            setVerifyingPromo(false);
        }
    };

    // SECURE: Production Ready Order Flow
    const placeOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            const res = await loadRazorpay();
            if (!res) throw new Error("Razorpay failed to load. Check internet connection.");

            // STEP 1: Backend se secure order_id banna chahiye
            const orderPayload = {
                items, address, subtotal, shipping, total, withBox, boxFee,
                couponCode: appliedCoupon?.code || ''
            };
            
            const { data: rzpOrder } = await api.post('/orders/create-razorpay-order', orderPayload);

            // Map the UI selection to a real Razorpay payment method so the
            // checkout modal opens directly on the method the user picked.
            // (Web checkout can pre-select UPI, but can't deep-link into a
            // specific UPI app — that intent-jump only exists on mobile SDKs.)
            const rzpMethodMap = {
                gpay: 'upi', phonepe: 'upi', paytm: 'upi', upi_other: 'upi',
                card: 'card', netbanking: 'netbanking',
            };
            const rzpMethod = rzpMethodMap[selectedMethod] || 'upi';

            // STEP 2: Razorpay Popup Kholna
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_T43iPj7kF0K5zT",
                amount: rzpOrder.amount, // Secured amount from backend
                currency: rzpOrder.currency || "INR",
                name: "GenzDial",
                description: "Order Payment",
                order_id: rzpOrder.id, // Secured ID from backend
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                },
                handler: async function (response) {
                    // STEP 3: Payment Verification & Final Save
                    try {
                        const { data: finalOrder } = await api.post('/orders/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: orderPayload
                        });
                        
                        // Backend returns { success, message, order } — use the nested order
                        setOrder(finalOrder.order || finalOrder);
                        setStep('done');
                        if (!buyNow) cart.clearCart();
                    } catch (err) {
                        setError("Payment verification failed! Our team will review this transaction.");
                    } finally {
                        setPlacing(false);
                    }
                },
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                    email: user?.email || "",
                    method: rzpMethod // Opens Razorpay directly on the selected method
                },
                theme: { color: "#8b5cf6" },
                modal: {
                    ondismiss: function() {
                        // Agar user popup cancel kar de
                        setPlacing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                setError("Payment Failed! " + response.error.description);
                setPlacing(false);
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to place order');
            setPlacing(false);
        }
    };

    // Styling helpers
    const headingStyle = { fontSize: '13px', fontWeight: 'bold', color: '#555', marginTop: '24px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const boxStyle = { background: '#fff', border: '1px solid #d5d9d9', borderRadius: '8px', overflow: 'hidden' };
    const rowStyle = { display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #d5d9d9', cursor: 'pointer', gap: '15px' };
    const lastRowStyle = { ...rowStyle, borderBottom: 'none' };
    const radioStyle = { width: '20px', height: '20px', accentColor: '#007185' };
    const textMain = { fontSize: '15px', color: '#0f1111', fontWeight: '500' };
    const textSub = { fontSize: '13px', color: '#565959', marginTop: '2px' };

    return (
        <section className="container section">
            <h2>Checkout</h2>
            <div className="checkout-steps">
                <span className={step === 'address' ? 'active' : (step === 'pay' || step === 'done' ? 'done' : '')}>1. Address</span>
                <span className={step === 'pay' ? 'active' : (step === 'done' ? 'done' : '')}>2. Payment</span>
                <span className={step === 'done' ? 'active' : ''}>3. Confirm</span>
            </div>

            <div className="checkout-grid">
                <div className="checkout-main">
                    {step === 'address' && (
                        <form className="address-form" onSubmit={submitAddress}>
                            <h3>Shipping Address</h3>
                            <div className="form-row">
                                <input placeholder="Full Name*" value={address.fullName}
                                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                                <input placeholder="Mobile Number*" inputMode="numeric" maxLength={10} value={address.phone}
                                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '') })} />
                            </div>
                            <input placeholder="Address Line 1*" value={address.line1}
                                onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                            <input placeholder="Address Line 2 (optional)" value={address.line2}
                                onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                            <div className="form-row">
                                <input placeholder="City*" value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                                <input placeholder="State*" value={address.state}
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <input placeholder="Pincode*" inputMode="numeric" maxLength={6} value={address.pincode}
                                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })} />
                                <input placeholder="Country" value={address.country} readOnly />
                            </div>
                            {error && <div className="login-error">{error}</div>}
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Continue to Payment →</button>
                        </form>
                    )}

                    {step === 'pay' && (
                        <div className="pay-step" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '20px', margin: '0 0 10px 0' }}>Select a payment method</h3>
                            
                            {/* UPI SECTION */}
                            <div style={headingStyle}>UPI</div>
                            <div style={boxStyle}>
                                <div style={rowStyle} onClick={() => setSelectedMethod('gpay')}>
                                    <input type="radio" checked={selectedMethod === 'gpay'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={textMain}>Google Pay</div>
                                    </div>
                                    {/* Local assets ki jagah text ya emojis use kiye hain for better production practice without relying on external images that can break */}
                                    <span style={{ fontSize: '18px' }}>GPay</span>
                                </div>
                                
                                <div style={rowStyle} onClick={() => setSelectedMethod('phonepe')}>
                                    <input type="radio" checked={selectedMethod === 'phonepe'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={textMain}>PhonePe</div>
                                    </div>
                                    <span style={{ fontSize: '18px', color: '#5f259f', fontWeight: 'bold' }}>PhonePe</span>
                                </div>

                                <div style={rowStyle} onClick={() => setSelectedMethod('paytm')}>
                                    <input type="radio" checked={selectedMethod === 'paytm'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={textMain}>Paytm</div>
                                    </div>
                                    <span style={{ fontSize: '18px', color: '#002e6e', fontWeight: 'bold' }}>Paytm</span>
                                </div>

                                <div style={lastRowStyle} onClick={() => setSelectedMethod('upi_other')}>
                                    <input type="radio" checked={selectedMethod === 'upi_other'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={textMain}>Pay by any UPI App</div>
                                        <div style={textSub}>Google Pay, PhonePe, Paytm and more</div>
                                    </div>
                                    <span style={{ fontSize: '18px' }}>⚡</span>
                                </div>
                            </div>

                            {/* CARDS SECTION */}
                            <div style={headingStyle}>CREDIT & DEBIT CARDS</div>
                            <div style={boxStyle}>
                                <div style={lastRowStyle} onClick={() => setSelectedMethod('card')}>
                                    <input type="radio" checked={selectedMethod === 'card'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ ...textMain, color: '#007185' }}>⊕ Add a new credit or debit card</div>
                                    </div>
                                    <span style={{ fontSize: '20px' }}>💳</span>
                                </div>
                            </div>

                            {/* MORE WAYS TO PAY SECTION */}
                            <div style={headingStyle}>MORE WAYS TO PAY</div>
                            <div style={boxStyle}>
                                <div style={lastRowStyle} onClick={() => setSelectedMethod('netbanking')}>
                                    <input type="radio" checked={selectedMethod === 'netbanking'} readOnly style={radioStyle} />
                                    <div style={{ flex: 1 }}>
                                        <div style={textMain}>Net Banking</div>
                                    </div>
                                    <span style={{ fontSize: '20px' }}>🏦</span>
                                </div>
                            </div>

                            {/* PROMO CODE SECTION */}
                            <div style={{ marginTop: '24px', background: '#fff', border: '1px solid #d5d9d9', borderRadius: '8px', padding: '16px' }}>
                                <div 
                                    onClick={() => setShowPromo(!showPromo)} 
                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
                                >
                                    <span style={{ color: '#007185', fontSize: '15px', fontWeight: '500' }}>
                                        Add Gift Card or Promo Code
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#555' }}>
                                        {showPromo ? '▲' : '▼'}
                                    </span>
                                </div>
                                
                                {showPromo && (
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Enter Code" 
                                            value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value)}
                                            style={{ flex: 1, padding: '10px 14px', border: '1px solid #888c8c', borderRadius: '8px', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }}
                                        />
                                        <button 
                                            onClick={handleApplyPromo}
                                            disabled={verifyingPromo}
                                            type="button"
                                            style={{ background: '#fff', color: '#0f1111', border: '1px solid #d5d9d9', padding: '0 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                                        >
                                            {verifyingPromo ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                                {promoMessage && (
                                    <div style={{ color: promoMessage.includes('Invalid') ? '#d9534f' : '#067d62', fontSize: '13px', marginTop: '10px', fontWeight: '500' }}>
                                        {promoMessage}
                                    </div>
                                )}
                            </div>

                            {error && <div className="login-error" style={{ marginTop: '15px', padding: '10px', background: '#fae3e3', color: '#d9534f', borderRadius: '5px' }}>{error}</div>}
                            
                            {/* ACTION BUTTONS */}
                            <div className="pay-actions" style={{ marginTop: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button onClick={() => setStep('address')} style={{ background: 'transparent', border: '1px solid #d5d9d9', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                                    Back
                                </button>
                                <button disabled={placing} onClick={placeOrder} style={{ flex: 1, background: '#ffd814', color: '#0f1111', border: '1px solid #fcd200', padding: '14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    {placing ? 'Processing...' : 'Place Secure Order'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'done' && order && (
                        <div className="order-success" style={{ textAlign: 'center', padding: '40px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div className="order-tick" style={{ fontSize: '40px', color: '#067d62', marginBottom: '15px' }}>✓</div>
                            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Order Placed Successfully!</h3>
                            <p>Order ID: <strong>{order._id}</strong></p>
                            <p>Total Paid: <strong>₹{order.total}</strong></p>
                            <p style={{ color: '#555', marginTop: '15px', marginBottom: '25px' }}>We've sent a confirmation email. You can track it in your account.</p>
                            <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
                        </div>
                    )}
                </div>

                {step !== 'done' && (
                <aside className="checkout-summary">
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                    {items.map((i) => (
                        <div key={i._id} className="sum-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            {/* FIX: Use assetUrl for proper image loading */}
                            <img src={assetUrl(i.image)} alt={i.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
                            <div style={{ flex: 1 }}>
                                <div className="sum-name" style={{ fontSize: '14px', fontWeight: '500' }}>{i.name}</div>
                                <div className="sum-qty" style={{ fontSize: '12px', color: '#555' }}>Qty: {i.qty}</div>
                            </div>
                            <div className="sum-price" style={{ fontSize: '14px', fontWeight: 'bold' }}>₹{i.price * i.qty}</div>
                        </div>
                    ))}
                    <hr style={{ borderTop: '1px solid #eee', margin: '15px 0' }}/>
                    <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    {withBox && (
                        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Original box</span><span>₹{boxFee}</span></div>
                    )}
                    {discount > 0 && (
                        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', color: '#067d62', marginBottom: '8px' }}>
                            <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                            <span>− ₹{discount}</span>
                        </div>
                    )}
                    <hr style={{ borderTop: '1px solid #ccc', margin: '15px 0' }}/>
                    <div className="row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}><span>Total</span><span>₹{total}</span></div>
                </aside>
                )}
            </div>
        </section>
    );
}