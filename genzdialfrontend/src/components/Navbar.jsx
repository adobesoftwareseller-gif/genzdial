import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import logo from '../images/logo.png';
import cartIcon from '../images/cart.svg';
import loginIcon from '../images/login.svg';

export default function Navbar() {
    const { count } = useCart();
    const { user, openLogin, openSignup, logout } = useUserAuth();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const accountRef = useRef(null);

    useEffect(() => { setOpen(false); setSearchOpen(false); setAccountOpen(false); }, [pathname]);

    useEffect(() => {
        if (!accountOpen) return;
        const onClick = (e) => {
            if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [accountOpen]);

    const submitSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        navigate(`/shop?q=${encodeURIComponent(q)}`);
        setSearchOpen(false);
    };

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <header className="navbar">
            <div className="nav-inner">
                <button
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span /><span /><span />
                </button>

                <Link to="/" className="brand">
                    <img src={logo} alt="GenZdial" className="brand-logo" />
                </Link>

                <nav className={`nav-links ${open ? 'open' : ''}`}>
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/shop/men">Men</NavLink>
                    <NavLink to="/shop/women">Women</NavLink>
                    <NavLink to="/shop" end>Premium</NavLink>
                    <NavLink to="/shop/luxury">Couple</NavLink>
                </nav>

                <form className={`search ${searchOpen ? 'open' : ''}`} onSubmit={submitSearch} role="search">
                    <button type="submit" className="search-icon" aria-label="Search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.3-4.3" />
                        </svg>
                    </button>
                    <input
                        placeholder="Search for watches, brands and more"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>

                <div className="nav-actions">
                    <button
                        className="icon-btn nav-search-btn"
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.3-4.3" />
                        </svg>
                    </button>
                    <Link to="/cart" className="icon-btn" title="Cart">
                        <img src={cartIcon} alt="Cart" className="icon-img" />
                        {count > 0 && <span className="badge">{count}</span>}
                    </Link>
                    <div className="account-wrap" ref={accountRef}>
                        <button
                            className="icon-btn account-btn"
                            title={user ? `${user.name || 'Account'} (+91 ${user.phone})` : 'Login / Signup'}
                            onClick={() => setAccountOpen((v) => !v)}
                            type="button"
                        >
                            {user ? (
                                <span className="account-avatar" aria-hidden="true">
                                    {(user.name || user.phone || '?').trim().charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <img src={loginIcon} alt="Account" className="icon-img" />
                            )}
                        </button>
                        {user && accountOpen && (
                            <div className="account-menu" onClick={(e) => e.stopPropagation()}>
                                {user.name && <div className="account-name">{user.name}</div>}
                                <div className="account-phone">+91 {user.phone}</div>
                                <Link to="/orders" onClick={() => setAccountOpen(false)} className="account-link">
                                    My Orders
                                </Link>
                                <button type="button" onClick={() => { setAccountOpen(false); logout(); navigate('/'); }}>
                                    Logout
                                </button>
                            </div>
                        )}
                        {!user && accountOpen && (
                            <div className="account-menu" onClick={(e) => e.stopPropagation()}>
                                <button type="button" onClick={() => { setAccountOpen(false); openLogin(); }}>
                                    Login
                                </button>
                                <button type="button" className="account-signup" onClick={() => { setAccountOpen(false); openSignup(); }}>
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
        </header>
    );
}
