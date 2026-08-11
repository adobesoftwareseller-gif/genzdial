import { useEffect, useState } from 'react';
import api from '../api.js';
import downArrow from '../images/downarrow.svg';
import upArrow from '../images/uparrow.svg';
import PageHero from '../components/PageHero.jsx';
import { Shimmer } from '../components/Skeleton.jsx';

export default function FaqPage() {
    const [faqs, setFaqs] = useState([]);
    const [open, setOpen] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/faqs')
            .then((r) => setFaqs(Array.isArray(r.data) ? r.data : []))
            .catch(() => setFaqs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <PageHero title="Frequently Asked Questions" crumb="FAQs" />
            <section className="static-page">
                <div className="static-wrap">
                    {loading ? (
                        <div className="faq-list">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Shimmer key={i} className="sk-faq-item" />
                            ))}
                        </div>
                    ) : faqs.length === 0 ? (
                        <p className="muted">No FAQs available right now.</p>
                    ) : (
                        <div className="faq-list">
                            {faqs.map((item, i) => {
                                const isOpen = open === i;
                                return (
                                    <div className={`faq-item${isOpen ? ' open' : ''}`} key={item._id || i}>
                                        <button
                                            className="faq-q"
                                            onClick={() => setOpen(isOpen ? -1 : i)}
                                            aria-expanded={isOpen}
                                        >
                                            <span>{item.question}</span>
                                            <img
                                                className="faq-caret"
                                                src={isOpen ? upArrow : downArrow}
                                                alt={isOpen ? 'collapse' : 'expand'}
                                            />
                                        </button>
                                        <div className="faq-a-wrap" aria-hidden={!isOpen}>
                                            <div className="faq-a">{item.answer}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
