import { Link } from 'react-router-dom';

export default function Banner() {
    return (
        <section className="section">
            <div className="container">
                <div className="banner">
                    <div>
                        <h2>Buy More, Pay Less</h2>
                        <p>Add any 3 watches to your cart and get a premium leather strap absolutely free with your order.</p>
                        <span className="free">FREE GIFT INSIDE</span>
                        <div style={{ marginTop: 18 }}>
                            <Link to="/shop" className="btn-primary">Shop the offer →</Link>
                        </div>
                    </div>
                    <div className="art">⌚</div>
                </div>
            </div>
        </section>
    );
}
