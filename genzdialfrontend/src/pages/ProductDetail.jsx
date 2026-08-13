import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchProduct, fetchProducts } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { Shimmer } from '../components/Skeleton.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { requireAuth } = useUserAuth();
    const [product, setProduct] = useState(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [zoom, setZoom] = useState({ show: false, x: 0, y: 0 });
    const [selectedVariantIdx, setSelectedVariantIdx] = useState(null);
    const [related, setRelated] = useState([]);
    const stageRef = useRef(null);
    const relatedRef = useRef(null);
    const relatedPausedRef = useRef(false);

    useEffect(() => {
        setActiveIdx(0);
        setSelectedVariantIdx(null);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        fetchProduct(id).then(setProduct).catch(() => setProduct(null));
    }, [id]);

    useEffect(() => {
        if (!related.length) return;
        const el = relatedRef.current;
        if (!el) return;
        const pause = () => { relatedPausedRef.current = true; };
        const resume = () => { relatedPausedRef.current = false; };
        el.addEventListener('mouseenter', pause);
        el.addEventListener('mouseleave', resume);
        el.addEventListener('touchstart', pause, { passive: true });
        el.addEventListener('touchend', resume, { passive: true });

        const STEP = 260;
        const id = setInterval(() => {
            if (relatedPausedRef.current) return;
            const node = relatedRef.current;
            if (!node) return;
            const max = node.scrollWidth - node.clientWidth;
            if (node.scrollLeft >= max - 4) {
                node.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                node.scrollBy({ left: STEP, behavior: 'smooth' });
            }
        }, 2800);

        return () => {
            clearInterval(id);
            el.removeEventListener('mouseenter', pause);
            el.removeEventListener('mouseleave', resume);
            el.removeEventListener('touchstart', pause);
            el.removeEventListener('touchend', resume);
        };
    }, [related]);

    useEffect(() => {
        if (!product) return;
        const TARGET = 10;
        const dedupe = (list) => {
            const seen = new Set();
            const out = [];
            for (const p of list) {
                if (!p || !p._id) continue;
                if (p._id === product._id) continue;
                if (seen.has(p._id)) continue;
                seen.add(p._id);
                out.push(p);
            }
            return out;
        };

        Promise.all([
            fetchProducts({ category: product.category, limit: 20 }).catch(() => []),
            fetchProducts({ limit: 40 }).catch(() => []),
        ]).then(([sameCat, all]) => {
            const sameArr = Array.isArray(sameCat) ? sameCat : [];
            const allArr = Array.isArray(all) ? all : [];
            let combined = dedupe(sameArr);
            if (combined.length < TARGET) {
                const extras = dedupe(allArr).filter(
                    (p) => !combined.some((c) => c._id === p._id)
                );
                for (let i = extras.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [extras[i], extras[j]] = [extras[j], extras[i]];
                }
                combined = combined.concat(extras).slice(0, TARGET);
            } else {
                combined = combined.slice(0, TARGET);
            }
            setRelated(combined);
        });
    }, [product]);

    const gallery = useMemo(() => {
        if (!product) return [];
        const arr = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
            .filter(Boolean);
        return Array.from(new Set(arr));
    }, [product]);

    if (!product) {
        return (
            <section className="container pd-page">
                <div className="pd-layout">
                    <div className="pd-gallery">
                        <div className="pd-thumbs">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Shimmer key={i} className="sk-pd-thumb" />
                            ))}
                        </div>
                        <Shimmer className="sk-pd-stage" />
                    </div>
                    <div className="pd-info">
                        <Shimmer className="sk-line sk-line-sm" />
                        <Shimmer className="sk-line sk-pd-title" />
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-pd-price" />
                        <Shimmer className="sk-line sk-line-lg" />
                        <Shimmer className="sk-line sk-line-lg" />
                        <Shimmer className="sk-line sk-line-md" />
                        <div className="pd-actions">
                            <Shimmer className="sk-pd-qty" />
                            <Shimmer className="sk-pd-btn" />
                        </div>
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-line-sm" />
                    </div>
                </div>
            </section>
        );
    }

    const selectedVariant = selectedVariantIdx !== null ? product.colorVariants?.[selectedVariantIdx] : null;
    const activeImage = selectedVariant ? selectedVariant.image : (gallery[activeIdx] || product.image);
    const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const onMouseMove = (e) => {
        const el = stageRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoom({ show: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const LENS_SIZE = 140;
    const ZOOM_SCALE = 2.2;

    return (
        <section className="container pd-page">
            <div className="pd-layout">
                <div className="pd-gallery">
                    <div className="pd-thumbs">
                        {gallery.map((src, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`pd-thumb ${selectedVariantIdx === null && i === activeIdx ? 'active' : ''}`}
                                onClick={() => { setSelectedVariantIdx(null); setActiveIdx(i); }}
                                onMouseEnter={() => { setSelectedVariantIdx(null); setActiveIdx(i); }}
                                aria-label={`View image ${i + 1}`}
                            >
                                <img src={src} alt={`${product.name} ${i + 1}`} />
                            </button>
                        ))}
                    </div>

                    <div
                        className="pd-stage"
                        ref={stageRef}
                        onMouseEnter={() => setZoom((z) => ({ ...z, show: true }))}
                        onMouseLeave={() => setZoom({ show: false, x: 0, y: 0 })}
                        onMouseMove={onMouseMove}
                    >
                        <img className="pd-main-img" src={activeImage} alt={product.name} />
                        {zoom.show && (
                            <span
                                className="pd-lens"
                                style={{
                                    width: LENS_SIZE,
                                    height: LENS_SIZE,
                                    left: `calc(${zoom.x}% - ${LENS_SIZE / 2}px)`,
                                    top: `calc(${zoom.y}% - ${LENS_SIZE / 2}px)`,
                                }}
                            />
                        )}
                    </div>

                    {zoom.show && (
                        <div className="pd-zoom-pane" aria-hidden>
                            <div
                                className="pd-zoom-img"
                                style={{
                                    backgroundImage: `url(${activeImage})`,
                                    backgroundSize: `${ZOOM_SCALE * 100}% ${ZOOM_SCALE * 100}%`,
                                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="pd-info">
                    <p className="pd-brand">{product.brand?.toUpperCase()}</p>
                    <h1 className="pd-title">{product.name}</h1>
                    <div className="pd-rating">
                        <StarRating value={product.rating || 0} />
                        <small>{(product.rating || 0).toFixed(1)} · {product.reviews} reviews</small>
                    </div>

                    <div className="price-big">
                        <span className="price">₹ {Number(product.price).toLocaleString('en-IN')}</span>
                        {off > 0 && <span className="mrp">₹ {Number(product.mrp).toLocaleString('en-IN')}</span>}
                        {off > 0 && <span className="off-tag">-{off}% OFF</span>}
                    </div>

                    <p className="pd-desc">{product.description}</p>

                    {Array.isArray(product.colorVariants) && product.colorVariants.length > 0 && (
                        <div className="pd-color-variants">
                            <p className="pd-color-label">Color: <strong>{selectedVariant?.name || 'Default'}</strong></p>
                            <div className="pd-color-swatches">
                                {product.colorVariants.map((v, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`pd-color-swatch ${selectedVariantIdx === i ? 'active' : ''}`}
                                        style={{ backgroundColor: v.colorCode || '#ccc' }}
                                        title={v.name || `Color ${i + 1}`}
                                        onClick={() => setSelectedVariantIdx(selectedVariantIdx === i ? null : i)}
                                        aria-label={v.name || `Color ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pd-actions">
                        <button className="btn-primary pd-add-btn" onClick={() => {
                            addToCart({ ...product, image: activeImage }, 1);
                            toast.success(`${product.name} added to cart`);
                        }}>
                            Add to Cart →
                        </button>
                        <button className="btn-buy-now pd-buy-btn" onClick={() => {
                            addToCart({ ...product, image: activeImage }, 1);
                        }}>
                            Buy Now
                        </button>
                    </div>

                    <ul className="pd-bullets">
                        {(Array.isArray(product.highlights) && product.highlights.length > 0
                            ? product.highlights
                            : [
                                '2-year international warranty',
                                'Free shipping on prepaid orders',
                                '30-day easy returns',
                                '100% authentic, brand-sealed',
                            ]
                        ).map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {related.length > 0 && (
                <section className="related-section">
                    <div className="bs-head">
                        <h2>YOU MAY ALSO LIKE</h2>
                    </div>
                    <div className="related-wrap">
                        <button
                            type="button"
                            className="related-arrow left"
                            onClick={() => relatedRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                            aria-label="Previous"
                        >‹</button>
                        <div className="related-track" ref={relatedRef}>
                            {related.map((p) => (
                                <div className="related-card" key={p._id}>
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="related-arrow right"
                            onClick={() => relatedRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                            aria-label="Next"
                        >›</button>
                    </div>
                </section>
            )}
        </section>
    );
}

function StarRating({ value = 0, max = 5 }) {
    const v = Math.max(0, Math.min(max, Number(value) || 0));
    return (
        <span className="star-rating" aria-label={`Rating ${v} out of ${max}`}>
            {Array.from({ length: max }).map((_, i) => {
                const fill = Math.max(0, Math.min(1, v - i));
                return (
                    <span className="star-wrap" key={i}>
                        <span className="star-bg">★</span>
                        <span className="star-fg" style={{ width: `${fill * 100}%` }}>★</span>
                    </span>
                );
            })}
        </span>
    );
}
