import { Button } from "../ui/button";
import { buttonVariants } from "../ui/button";
import heroBackground from "@/assets/hero-background.png";

//TODO: Make the background responsive
export const Hero = () => {
  return (
    <section
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "110%",
      }}
      className="w-full h-[80vh] flex items-center"
    >
      <div className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold text-white">
            <h1 className="inline">
              Shadcn landing page
            </h1>{" "}
            for{" "}
            <h2 className="inline">
              <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                React
              </span>{" "}
              developers
            </h2>
          </main>

          <p className="text-xl text-white md:w-10/12 mx-auto lg:mx-0">
            Build your React landing page effortlessly with the required
            sections to your project.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button className="w-full md:w-1/3">Register</Button>

            <a
              rel="noreferrer noopener"
              href="https://github.com/leoMirandaa/shadcn-landing-page.git"
              target="_blank"
              className={`w-full md:w-1/3 ${buttonVariants({
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
