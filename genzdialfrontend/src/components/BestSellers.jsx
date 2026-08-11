import { useEffect, useState } from 'react';
import { fetchProducts } from '../api.js';
import ProductCard from './ProductCard.jsx';
import { BestSellersSkeleton } from './Skeleton.jsx';

export default function BestSellers({ title = 'Best Sellers', tag = 'Best Seller', limit = 5 }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts({ limit })
            .then((data) => setItems(Array.isArray(data) ? data.slice(0, limit) : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [limit]);

    if (loading) return <BestSellersSkeleton count={Math.min(limit, 5)} />;
    if (!items.length) return null;

    return (
        <section className="bestsellers">
            <div className="bs-head">
                <h2>{title}</h2>
            </div>
            <div className="bs-grid">
                {items.map((p) => (
                    <ProductCard key={p._id} product={{ ...p, tag: p.tag || tag }} />
                ))}
            </div>
        </section>
    );
}
