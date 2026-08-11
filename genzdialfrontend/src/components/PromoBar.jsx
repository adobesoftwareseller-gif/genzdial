import { useEffect, useState } from 'react';
import api from '../api.js';

export default function PromoBar() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        api.get('/promo-messages')
            .then((r) => {
                if (Array.isArray(r.data)) {
                    setMessages(r.data.map((m) => m.text).filter(Boolean));
                }
            })
            .catch(() => { });
    }, []);

    if (!messages.length) return null;
    const all = [...messages, ...messages];
    return (
        <div className="promo-bar">
            <div className="promo-track">
                {all.map((m, i) => (
                    <span key={i}>{m}</span>
                ))}
            </div>
        </div>
    );
}
