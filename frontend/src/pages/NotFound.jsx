import { Navbar } from "@/components/landingPage/Navbar";
import { Footer } from "@/components/landingPage/footer";


function NotFound() {
  return (
    <>
      <Navbar />
      <div
        className="flex flex-col justify-center items-end pr-[15vw] min-h-screen text-center text-white bg-[url('../assets/404-background.png')] bg-center bg-no-repeat bg-cover font-body"
      >
        <h1 className="font-montserrat text-[10rem] font-bold m-0">404</h1>
        <h2 className="font-montserrat text-[1.5rem] font-semibold m-0">Page Not Found</h2>
        <h2 className="text-xl">
          Go <a href="/" className="underline text-white">Home</a>
        </h2>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;