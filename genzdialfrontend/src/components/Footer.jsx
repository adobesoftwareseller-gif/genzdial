import { Link } from 'react-router-dom';
import footerLogo from '../images/footer-logo.png';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <img src={footerLogo} alt="GenZdial" className="footer-logo" />
                        <p className="footer-desc">
                            Delivering end-to-end digital solutions for educational publications through software development, lecture recording, AI tools, and innovative content technologies.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.instagram.com/genzdial?igsh=cmtpcGg1aTQ2b2Q0" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4>About Us</h4>
                        <ul className="footer-links">
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/terms-and-conditions">Terms &amp; Condition</Link></li>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Important Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/shop/men">Men</Link></li>
                            <li><Link to="/shop/women">Women</Link></li>
                            <li><Link to="/shop">Premium</Link></li>
                            <li><Link to="/shop/luxury">Couple</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <span className="contact-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.7-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1C8.7 6.5 8.5 5.2 8.5 4c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z" /></svg>
                                </span>
                                <span>+91 9355264173<br />+91 6362121501</span>
                            </li>
                            <li>
                                <span className="contact-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                </span>
                                <span>genzdial@gmail.com</span>
                            </li>
                            <li>
                                <span className="contact-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" /></svg>
                                </span>
                                <span>Shop no-1010, Street no-32,<br />Jafrabad, Delhi, 110053</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="copyright">
                    <span>© Copyright {new Date().getFullYear()} All Rights Reserved by GenZdial</span>
                </div>
            </div>
        </footer>
    );
}
