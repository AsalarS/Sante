import { useState, useEffect } from 'react';
import { Navbar } from "@/components/landingPage/Navbar";
import { Footer } from "@/components/landingPage/footer";
import { useNavigate } from 'react-router-dom';

function ErrorPage({ error = 404 }) {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (error === 404) {
      setErrorMessage('Page Not Found');
    } else if (error === 401) {
      setErrorMessage('Unauthorized');
    } else {
      setErrorMessage('An unexpected error occurred');
    }
  }, [error]);

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col justify-center items-end pr-[15vw] min-h-screen text-center text-white bg-[url('../assets/404-background.png')] bg-center bg-no-repeat bg-cover font-body"
      >
        <h1 className="font-montserrat text-[10rem] font-bold m-0">{error}</h1>
        <h2 className="font-montserrat text-[1.5rem] font-semibold m-0">{errorMessage}</h2>
        <h2 className="text-xl">
          Go <a href="/" className="underline text-white">Home</a> or <a onClick={() => navigate(-1)} className="underline text-white cursor-pointer">Back</a>
        </h2>
      </div>
      <Footer />
    </>
  );
}

export default ErrorPage;