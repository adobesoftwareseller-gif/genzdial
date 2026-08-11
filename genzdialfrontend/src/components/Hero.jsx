import { Link } from 'react-router-dom';
import banner1 from '../images/banner1.png';

export default function Hero() {
    return (
        <section className="hero">
            <div className="container hero-grid">
                <div>
                    <div className="hero-eyebrow">Hello,</div>
                    <h1>Timeless<br />Elegance.</h1>
                    <p>Discover precision-crafted watches — from minimalist daily wear to luxury automatics. Pick any 3 and save big.</p>

                    <div className="hero-deal">
                        <span className="label">BUY ANY 3 WATCHES AT</span>
                        <span className="price">3 <small>for</small> ₹1999</span>
                    </div>

                    <div>
                        <Link to="/shop" className="hero-cta">Shop Collection →</Link>
                    </div>
                </div>

                <div className="hero-art">
                    <img src={banner1} alt="Featured watch" />
                </div>
            </div>
        </section>
    );
}
