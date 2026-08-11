import { useEffect, useState } from 'react';
import api from '../api.js';
import { PromoBannerSkeleton } from './Skeleton.jsx';

export default function PromoBanner() {
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/banners?placement=mid')
            .then((r) => {
                if (Array.isArray(r.data) && r.data.length > 0) setBanner(r.data[0]);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <PromoBannerSkeleton />;
    if (!banner) return null;

    return (
        <section className="promo-banner">
            <a href={banner.link || '/shop'}>
                <img src={banner.image} alt={banner.title || 'Promotion'} />
            </a>
        </section>
    );
}
