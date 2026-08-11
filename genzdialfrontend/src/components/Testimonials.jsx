import { useEffect, useRef, useState } from 'react';
import api from '../api.js';
import quoteIcon from '../images/quote.svg';
import { TestimonialsSkeleton } from './Skeleton.jsx';

export default function Testimonials() {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [perPage, setPerPage] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 1 : 2
    );
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    const timer = useRef(null);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e) => {
            setPerPage(e.matches ? 1 : 2);
            setPage(0);
        };
        mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
        return () => {
            mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
        };
    }, []);

    useEffect(() => {
        api.get('/testimonials')
            .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const prev = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
    const next = () => setPage((p) => (p === totalPages - 1 ? 0 : p + 1));

    useEffect(() => {
        if (totalPages <= 1) return;
        timer.current = setInterval(() => {
            setPage((p) => (p === totalPages - 1 ? 0 : p + 1));
        }, 4500);
        return () => clearInterval(timer.current);
    }, [totalPages]);

    if (loading) return <TestimonialsSkeleton />;
    if (!items.length) return null;

    return (
        <section className="testimonials">
            <div className="testi-head">
                <h2>TESTIMONIALS</h2>
            </div>

            <div className="testi-wrap">
                <button className="testi-arrow left" onClick={prev} aria-label="Previous">
                    &#x2039;
                </button>

                <div className="testi-viewport">
                    <div
                        className="testi-track"
                        style={{ transform: `translateX(-${page * 100}%)` }}
                    >
                        {Array.from({ length: totalPages }).map((_, pageIdx) => {
                            const slice = items.slice(pageIdx * perPage, pageIdx * perPage + perPage);
                            return (
                                <div className="testi-slide" key={pageIdx}>
                                    {slice.map((t, i) => (
                                        <article className="testi-card" key={pageIdx + '-' + i}>
                                            <img src={quoteIcon} alt="" className="testi-quote" />
                                            <div className="testi-rating">
                                                <span className="star">&#9733;</span>
                                                <span>{t.rating} <small>/10</small></span>
                                            </div>
                                            <div className="testi-meta">
                                                <strong>{t.name}</strong>
                                                <span>{t.date}</span>
                                            </div>
                                            <p className="testi-text">{t.text}</p>
                                        </article>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button className="testi-arrow right" onClick={next} aria-label="Next">
                    &#x203A;
                </button>
            </div>

            <div className="testi-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                        key={i}
                        className={'testi-dot' + (i === page ? ' active' : '')}
                        onClick={() => setPage(i)}
                        aria-label={`Go to page ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
