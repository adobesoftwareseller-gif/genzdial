import { useEffect, useState } from 'react';
import api from '../api.js';
import PageHero from '../components/PageHero.jsx';
import RenderRichText from '../components/RenderRichText.jsx';
import { Shimmer } from '../components/Skeleton.jsx';

export default function StaticPage({ slug, fallbackTitle }) {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        api.get(`/pages/${slug}`)
            .then((r) => setPage(r.data))
            .catch((e) => setError(e.response?.data?.message || 'Page not available'))
            .finally(() => setLoading(false));
    }, [slug]);

    const title = page?.title || fallbackTitle;

    return (
        <>
            <PageHero title={title} crumb={title} />
            <section className="static-page">
                <div className="static-wrap">
                    {loading && (
                        <div className="static-content">
                            <Shimmer className="sk-line sk-line-md" style={{ width: '30%' }} />
                            <Shimmer className="sk-line sk-line-lg" />
                            <Shimmer className="sk-line sk-line-lg" />
                            <Shimmer className="sk-line sk-line-md" />
                            <Shimmer className="sk-line sk-line-md" style={{ width: '40%', marginTop: 20 }} />
                            <Shimmer className="sk-line sk-line-lg" />
                            <Shimmer className="sk-line sk-line-lg" />
                            <Shimmer className="sk-line sk-line-md" />
                        </div>
                    )}
                    {!loading && error && <p className="muted">{error}</p>}
                    {!loading && !error && page && (
                        <div className="static-content">
                            <RenderRichText text={page.content} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
