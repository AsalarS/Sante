import { Footer } from "@/components/landingPage/footer"
import { Navbar } from "@/components/landingPage/Navbar"
import { ScrollToTop } from "@/components/ScrollToTop"
import { Testimonials } from "@/components/landingPage/testimnoials"
import { Team } from "@/components/landingPage/team"
import { Services } from "@/components/landingPage/Services"
import { Features } from "@/components/landingPage/features"
import { Hero } from "@/components/landingPage/hero"


function Home() {
    return <>
        <Navbar />
        <Hero />
        <Features />
        <Services />
        <Team />
        <Testimonials />
        <Footer />
        <ScrollToTop/>
    </>
}

export default Home