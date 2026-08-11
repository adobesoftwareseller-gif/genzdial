import { Link } from 'react-router-dom';

const concerns = [
    { label: 'Daily Wear', icon: '☀️', to: '/shop/unisex' },
    { label: 'Office Style', icon: '💼', to: '/shop/men' },
    { label: 'Fitness & Sports', icon: '🏋️', to: '/shop/sports' },
    { label: 'Smart Tracking', icon: '📊', to: '/shop/smart' },
    { label: 'Couple', icon: '🎁', to: '/shop/luxury' },
];

export default function Concerns() {
    return (
        <section className="section">
            <div className="container">
                <h2>Shop By Occasion</h2>
                <p className="subtitle">A timepiece for every moment</p>
                <div className="concerns">
                    {concerns.map((c) => (
                        <Link key={c.label} to={c.to} className="concern">
                            <span className="icon-bubble">{c.icon}</span>
                            {c.label}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
