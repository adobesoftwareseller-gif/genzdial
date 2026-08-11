import { Link } from 'react-router-dom';

const categories = [
    { key: 'men', label: "Men's Watches", emoji: '⌚' },
    { key: 'women', label: "Women's Watches", emoji: '⏱️' },
    { key: 'smart', label: 'Smart Watches', emoji: '📱' },
    { key: 'luxury', label: 'Luxury', emoji: '💎' },
    { key: 'sports', label: 'Sports', emoji: '🏃' },
    { key: 'unisex', label: 'Unisex', emoji: '✨' },
];

export default function Categories() {
    return (
        <section className="section">
            <div className="container">
                <h2>Shop By Categories</h2>
                <p className="subtitle">Find the perfect watch for every occasion</p>
                <div className="cats">
                    {categories.map((c) => (
                        <Link key={c.key} to={`/shop/${c.key}`} className="cat">
                            <div className="emoji">{c.emoji}</div>
                            <div className="label">{c.label}</div>
                            <div className="more">Explore →</div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
