import { Footer } from "@/components/landingPage/footer";
import { Navbar } from "@/components/landingPage/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Testimonials } from "@/components/landingPage/testimnoials";
import { Team } from "@/components/landingPage/team";
import { Services } from "@/components/landingPage/Services";
import { Features } from "@/components/landingPage/features";
import { Hero } from "@/components/landingPage/hero";

function Landing() {
    return (
        <>
            <Navbar />
            <div className="bg-background">
                <Hero />
                <Features />
                <Services />
                <Team />
                <Testimonials />
                <Footer />
            </div>
            <ScrollToTop />
        </>
    );
}

export default Landing;
