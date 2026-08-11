import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import PageHero from '../components/PageHero.jsx';
import { ProductsGridSkeleton } from '../components/Skeleton.jsx';
import { fetchProducts } from '../api.js';

export default function Products() {
    const { category } = useParams();
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (category) params.category = category;
        if (q) params.q = q;
        fetchProducts(params)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, [category, q]);

    const titleCase = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
    const heroTitle = q
        ? 'Search Results'
        : category
            ? `${titleCase(category)} Watches`
            : 'All Watches';
    const heroCrumb = q
        ? `Search: ${q}`
        : category
            ? titleCase(category)
            : 'Shop';

    return (
        <>
            <PageHero title={heroTitle} crumb={heroCrumb} />
            <section className="section">
                <div className="container">

                    {loading ? (
                        <ProductsGridSkeleton count={8} />
                    ) : products.length === 0 ? (
                        <div className="empty">
                            {q ? `No watches match "${q}".` : 'No products in this category yet.'}
                        </div>
                    ) : (
                        <div className="grid">
                            {products.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
