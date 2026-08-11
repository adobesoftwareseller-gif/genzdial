import { useEffect, useState } from 'react';
import api from '../api.js';
import downArrow from '../images/downarrow.svg';
import upArrow from '../images/uparrow.svg';
import { FAQSkeleton } from './Skeleton.jsx';

export default function FAQ() {
    const [faqs, setFaqs] = useState([]);
    const [open, setOpen] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/faqs')
            .then((r) => setFaqs(Array.isArray(r.data) ? r.data : []))
            .catch(() => setFaqs([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <FAQSkeleton />;
    if (!faqs.length) return null;

    return (
        <section className="faq-section">
            <div className="faq-wrap">
                <h2 className="faq-head">FAQs</h2>
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
            </div>
        </section>
    );
}
