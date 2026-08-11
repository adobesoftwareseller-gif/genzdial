import HeroSlider from '../components/HeroSlider.jsx';
import ReelSection from '../components/ReelSection.jsx';
import BestSellers from '../components/BestSellers.jsx';
import Testimonials from '../components/Testimonials.jsx';
import MediaStrip from '../components/MediaStrip.jsx';
import FAQ from '../components/FAQ.jsx';
import PromoBanner from '../components/PromoBanner.jsx';

export default function Home() {
    return (
        <>
            <HeroSlider />
            <ReelSection />
            <BestSellers title="OUR COLLECTION" tag="Best Seller" limit={15} />
            <PromoBanner />
            <Testimonials />
            <MediaStrip />
            <FAQ />
        </>
    );
}
