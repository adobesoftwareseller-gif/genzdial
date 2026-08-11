import { useEffect, useState } from 'react';
import api from '../api.js';
import { MediaStripSkeleton } from './Skeleton.jsx';

export default function MediaStrip() {
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/media-logos')
            .then((r) => setLogos(Array.isArray(r.data) ? r.data : []))
            .catch(() => setLogos([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <MediaStripSkeleton />;
    if (!logos.length) return null;

    const items = [...logos, ...logos];
    return (
        <section className="media-strip">
            <div className="media-track">
                {items.map((m, i) => (
                    <div className="media-logo" key={i}>
                        {m.link ? (
                            <a href={m.link} target="_blank" rel="noopener noreferrer">
                                <img src={m.image} alt={m.name || 'logo'} />
                            </a>
                        ) : (
                            <img src={m.image} alt={m.name || 'logo'} />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
