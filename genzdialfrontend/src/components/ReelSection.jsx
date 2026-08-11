import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { assetUrl } from '../api.js';
import { ReelSkeleton } from './Skeleton.jsx';

export default function ReelSection() {
    const [reels, setReels] = useState([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [loading, setLoading] = useState(true);
    const trackRef = useRef(null);

    useEffect(() => {
        api.get('/reels')
            .then((r) => setReels(r.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Auto-play thumbnails when in viewport, pause when out
    useEffect(() => {
        if (!reels.length) return;
        const vids = trackRef.current?.querySelectorAll('video') || [];
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    const v = e.target;
                    if (e.isIntersecting) v.play().catch(() => { });
                    else v.pause();
                });
            },
            { threshold: 0.4 }
        );
        vids.forEach((v) => io.observe(v));
        return () => io.disconnect();
    }, [reels]);

    if (loading) return <ReelSkeleton />;
    if (!reels.length) return null;

    const scrollBy = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('.reel-card');
        const step = card ? card.offsetWidth + 16 : 320;
        el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    };

    return (
        <section className="reel-section">
            <h2 className="reel-heading">EXPERIENCE THE WORLD OF GENZDIAL</h2>

            <div className="reel-wrap">
                <button className="reel-arrow left" onClick={() => scrollBy(-1)} aria-label="Previous">‹</button>

                <div className="reel-track" ref={trackRef}>
                    {reels.map((r, i) => (
                        <button
                            key={r._id}
                            className="reel-card"
                            onClick={() => setActiveIdx(i)}
                            aria-label="Open reel"
                        >
                            <video
                                src={assetUrl(r.video)}
                                poster={r.poster ? assetUrl(r.poster) : undefined}
                                muted
                                loop
                                autoPlay
                                playsInline
                                preload="metadata"
                            />
                            <span className="reel-cta">{r.label || 'Shop Now'}</span>
                        </button>
                    ))}
                </div>

                <button className="reel-arrow right" onClick={() => scrollBy(1)} aria-label="Next">›</button>
            </div>

            {activeIdx >= 0 && (
                <ReelLightbox
                    reels={reels}
                    index={activeIdx}
                    setIndex={setActiveIdx}
                    onClose={() => setActiveIdx(-1)}
                />
            )}
        </section>
    );
}

function ReelLightbox({ reels, index, setIndex, onClose }) {
    const videoRef = useRef(null);
    const reel = reels[index];

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
            else if (e.key === 'ArrowRight' && index < reels.length - 1) setIndex(index + 1);
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [index, reels.length, setIndex, onClose]);

    // Play with audio when slide changes; fall back to muted if browser blocks
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.currentTime = 0;
        const p = v.play();
        if (p && p.catch) {
            p.catch(() => {
                v.muted = true;
                v.play().catch(() => { });
            });
        }
    }, [index]);

    if (!reel) return null;
    const prev = reels[index - 1];
    const next = reels[index + 1];

    return (
        <div className="reel-modal" onClick={onClose}>
            <button className="reel-modal-close" onClick={onClose} aria-label="Close">×</button>

            {prev && (
                <button
                    className="reel-modal-prev"
                    onClick={(e) => { e.stopPropagation(); setIndex(index - 1); }}
                    aria-label="Previous"
                >‹</button>
            )}

            <div className="reel-modal-stage" onClick={(e) => e.stopPropagation()}>
                {prev && (
                    <div className="reel-modal-side left" onClick={() => setIndex(index - 1)}>
                        <video src={assetUrl(prev.video)} muted loop autoPlay playsInline />
                    </div>
                )}

                <div className="reel-modal-active">
                    <video
                        key={reel._id}
                        ref={videoRef}
                        src={assetUrl(reel.video)}
                        poster={reel.poster ? assetUrl(reel.poster) : undefined}
                        controls
                        autoPlay
                        loop
                        playsInline
                    />
                    {reel.link && (
                        <Link to={reel.link} className="reel-modal-cta" onClick={onClose}>
                            {reel.label || 'Shop Now'}
                        </Link>
                    )}
                </div>

                {next && (
                    <div className="reel-modal-side right" onClick={() => setIndex(index + 1)}>
                        <video src={assetUrl(next.video)} muted loop autoPlay playsInline />
                    </div>
                )}
            </div>

            {next && (
                <button
                    className="reel-modal-next"
                    onClick={(e) => { e.stopPropagation(); setIndex(index + 1); }}
                    aria-label="Next"
                >›</button>
            )}
        </div>
    );
}
