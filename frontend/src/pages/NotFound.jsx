import { Navbar } from "@/components/landingPage/Navbar";
import "../styles/Index.css";
import { Footer } from "@/components/landingPage/footer";

function NotFound() {
  return <div className="not-found">

    <div>
      <Navbar />
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <h2>Go <a href="/" className="underline">
        Home
      </a></h2>
      <Footer />
    </div>

  </div>
}

export default NotFound

//TODO: Add tailwind