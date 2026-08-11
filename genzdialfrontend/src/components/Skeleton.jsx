export function Shimmer({ className = '', style }) {
    return <div className={`shimmer ${className}`} style={style} />;
}

export function HeroSkeleton() {
    return (
        <section className="hero-slider">
            <Shimmer className="sk-hero" />
        </section>
    );
}

export function ReelSkeleton() {
    return (
        <section className="reel-section">
            <Shimmer className="sk-line sk-title" />
            <div className="reel-wrap">
                <div className="reel-track sk-reel-track">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Shimmer key={i} className="sk-reel-card" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function BestSellersSkeleton({ count = 5 }) {
    return (
        <section className="bestsellers">
            <div className="bs-head">
                <Shimmer className="sk-line sk-title" />
            </div>
            <div className="bs-grid">
                {Array.from({ length: count }).map((_, i) => (
                    <div className="card sk-card" key={i}>
                        <Shimmer className="sk-card-img" />
                        <div className="body">
                            <Shimmer className="sk-line sk-line-sm" />
                            <Shimmer className="sk-line sk-line-md" />
                            <Shimmer className="sk-line sk-line-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function PromoBannerSkeleton() {
    return (
        <section className="promo-banner">
            <Shimmer className="sk-promo" />
        </section>
    );
}

export function TestimonialsSkeleton() {
    return (
        <section className="testimonials">
            <div className="testi-head">
                <Shimmer className="sk-line sk-title" />
            </div>
            <div className="testi-wrap">
                <div className="testi-viewport">
                    <div className="testi-slide sk-testi-slide">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div className="testi-card sk-testi-card" key={i}>
                                <Shimmer className="sk-line sk-line-sm" />
                                <Shimmer className="sk-line sk-line-md" />
                                <Shimmer className="sk-line sk-line-lg" />
                                <Shimmer className="sk-line sk-line-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function MediaStripSkeleton() {
    return (
        <section className="media-strip">
            <div className="media-track">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div className="media-logo" key={i}>
                        <Shimmer className="sk-media-logo" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export function FAQSkeleton() {
    return (
        <section className="faq-section">
            <div className="faq-wrap">
                <Shimmer className="sk-line sk-title" />
                <div className="faq-list">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Shimmer key={i} className="sk-faq-item" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ProductsGridSkeleton({ count = 8 }) {
    return (
        <div className="grid">
            {Array.from({ length: count }).map((_, i) => (
                <div className="card sk-card" key={i}>
                    <Shimmer className="sk-card-img" />
                    <div className="body">
                        <Shimmer className="sk-line sk-line-sm" />
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-line-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="pd-wrap">
            <div className="pd-grid">
                <Shimmer className="sk-pd-image" />
                <div className="pd-info">
                    <Shimmer className="sk-line sk-line-sm" style={{ width: '40%' }} />
                    <Shimmer className="sk-line sk-line-lg" style={{ height: 24, margin: '12px 0' }} />
                    <Shimmer className="sk-line sk-line-md" style={{ width: '60%' }} />
                    <Shimmer className="sk-line sk-line-lg" style={{ height: 18, margin: '14px 0' }} />
                    <Shimmer className="sk-line sk-line-lg" />
                    <Shimmer className="sk-line sk-line-md" />
                    <Shimmer className="sk-line sk-line-lg" style={{ height: 44, marginTop: 20, borderRadius: 8 }} />
                </div>
            </div>
        </div>
    );
}

export function OrdersSkeleton({ count = 3 }) {
    return (
        <div className="my-orders">
            {Array.from({ length: count }).map((_, i) => (
                <div className="my-order" key={i}>
                    <div className="mo-head" style={{ cursor: 'default' }}>
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-line-sm" />
                        <Shimmer className="sk-line sk-line-sm" style={{ justifySelf: 'end', width: 90 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function CartSkeleton({ count = 2 }) {
    return (
        <div className="cart-list">
            {Array.from({ length: count }).map((_, i) => (
                <div className="cart-row sk-cart-row" key={i}>
                    <Shimmer className="sk-cart-img" />
                    <div className="cart-info">
                        <Shimmer className="sk-line sk-line-sm" />
                        <Shimmer className="sk-line sk-line-md" />
                        <Shimmer className="sk-line sk-line-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
