import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext.jsx';

export default function AdminLayout() {
    const { isAuthed, admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    if (!isAuthed) return <Navigate to="/admin/login" replace />;

    return (
        <div className="admin-shell">
            <header className="admin-topbar">
                <div className="admin-brand">⌚ GenZdial</div>
                <button
                    className="admin-hamburger"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(o => !o)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </header>
            {menuOpen && <div className="admin-overlay" onClick={() => setMenuOpen(false)} />}
            <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
                <div className="admin-brand">⌚ GenZdial</div>
                <p className="admin-sub">Admin Panel</p>
                <nav className="admin-nav" onClick={() => setMenuOpen(false)}>
                    <NavLink to="/admin" end>📊 Dashboard</NavLink>
                    <NavLink to="/admin/orders">📦 Orders</NavLink>
                    <NavLink to="/admin/products">🛒 Products</NavLink>
                    <NavLink to="/admin/banners">🖼️ Banners</NavLink>
                    <NavLink to="/admin/reels">🎬 Reels</NavLink>
                    <NavLink to="/admin/testimonials">💬 Testimonials</NavLink>
                    <NavLink to="/admin/promo-messages">📢 Promo Strip</NavLink>
                    <NavLink to="/admin/media-logos">🗞️ Media Logos</NavLink>
                    <NavLink to="/admin/faqs">❓ FAQs</NavLink>
                    <NavLink to="/admin/coupons">🏷️ Coupons</NavLink>
                    <NavLink to="/admin/settings">⚙️ Payment</NavLink>
                    <NavLink to="/admin/pages">📄 Pages</NavLink>
                </nav>
                <div className="admin-user">
                    <div>{admin?.name}</div>
                    <small>{admin?.email}</small>
                    <button className="btn-logout" onClick={() => { logout(); navigate('/admin/login'); }}>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
