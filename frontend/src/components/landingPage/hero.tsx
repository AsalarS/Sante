import React from "react";
import { ACCESS_TOKEN } from "@/constants";
import { Button } from "../ui/button";
import { buttonVariants } from "../ui/button";
import heroBackground from "@/assets/hero-background.png";
import { Link } from "react-router-dom";

export const Hero = () => {
  const userInfo = localStorage.getItem('user_info');

  let token = null;
  let role = null;


  if (userInfo) {
    const userInfoObject = JSON.parse(userInfo);
    role = userInfoObject.role;
    token = localStorage.getItem(ACCESS_TOKEN);

  }

  return (
    <section
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="w-full min-h-screen max-w-full flex items-center"
      id="hero"
    >
      <div className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10 ">
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold text-white">
            <h1 className="inline">
              Modern Health Solutions
            </h1>{" "}
            for{" "}
            <h2 className="inline">
            <span className="inline bg-linear-to-r from-[#6c89fe] via-[#8fa9ff] to-[#98abe2] text-transparent bg-clip-text">
                Patients
              </span>{" "}
              & {" "}
              <span className="inline bg-linear-to-r from-[#b0bce9] via-[#6c89fe] to-[#8f9edd] text-transparent bg-clip-text">
                Providers
              </span>
            </h2>
          </main>

          <p className="text-xl text-white md:w-10/12 mx-auto lg:mx-0">
            Simplify healthcare management with our intuitive system, offering secure patient records, easy scheduling, and advanced health analytics.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            {token
              ? <Button className="w-full md:w-1/3" asChild>
                <Link to={`/${role}`}>Dashboard</Link>
              </Button>
              : <Button className="w-full md:w-1/3" asChild>
                <Link to="/register">Register</Link>
              </Button>}
            <a
              rel="noreferrer noopener"
              href="#footer"
              className={`w-full md:w-1/3 text-foreground ${buttonVariants({
                variant: "outline",
              })}`}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
