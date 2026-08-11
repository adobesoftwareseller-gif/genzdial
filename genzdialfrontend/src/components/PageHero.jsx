import { Link } from 'react-router-dom';

export default function PageHero({ title, crumb }) {
    return (
        <section className="page-hero">
            <div className="page-hero-inner">
                <h1 className="page-hero-title">{title}</h1>
                <div className="page-hero-crumb">
                    <Link to="/" className="ph-home">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 3.2 2 11h3v9h5v-6h4v6h5v-9h3z" />
                        </svg>
                        <span>Home</span>
                    </Link>
                    <span className="ph-sep">›</span>
                    <span className="ph-current">{crumb || title}</span>
                </div>
            </div>
        </section>
    );
}
