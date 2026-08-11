import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar.jsx';
import PromoBar from './components/PromoBar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import LoginModal from './components/LoginModal.jsx';
import SignupModal from './components/SignupModal.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import MyOrders from './pages/MyOrders.jsx';
import FaqPage from './pages/FaqPage.jsx';
import StaticPage from './pages/StaticPage.jsx';

import { AdminAuthProvider } from './admin/AuthContext.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminProducts from './admin/AdminProducts.jsx';
import AdminBanners from './admin/AdminBanners.jsx';
import AdminReels from './admin/AdminReels.jsx';
import AdminTestimonials from './admin/AdminTestimonials.jsx';
import AdminPromoMessages from './admin/AdminPromoMessages.jsx';
import AdminMediaLogos from './admin/AdminMediaLogos.jsx';
import AdminFaqs from './admin/AdminFaqs.jsx';
import AdminCoupons from './admin/AdminCoupons.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminPages from './admin/AdminPages.jsx';
import AdminOrders from './admin/AdminOrders.jsx';

export default function App() {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <AdminAuthProvider>
            <ScrollToTop />
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnHover={false} theme="light" />
            {!isAdmin && <PromoBar />}
            {!isAdmin && <Navbar />}
            {!isAdmin && <CartDrawer />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Products />} />
                <Route path="/shop/:category" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/privacy-policy" element={<StaticPage slug="privacy-policy" fallbackTitle="Privacy Policy" />} />
                <Route path="/terms-and-conditions" element={<StaticPage slug="terms-and-conditions" fallbackTitle="Terms & Conditions" />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="reels" element={<AdminReels />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="promo-messages" element={<AdminPromoMessages />} />
                    <Route path="media-logos" element={<AdminMediaLogos />} />
                    <Route path="faqs" element={<AdminFaqs />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="pages" element={<AdminPages />} />
                    <Route path="orders" element={<AdminOrders />} />
                </Route>
            </Routes>
            {!isAdmin && <Footer />}
            {!isAdmin && <LoginModal />}
            {!isAdmin && <SignupModal />}
        </AdminAuthProvider>
    );
}