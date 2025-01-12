import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facebook, Instagram, Linkedin } from "lucide-react";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworkslProps[];
}

interface SociaNetworkslProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: "https://i.pravatar.cc/150?img=35",
    name: "Dr. Emma Carter",
    position: "Cardiologist",
    description: "Dr. Carter specializes in diagnosing and treating heart-related conditions, providing compassionate care and expert advice.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/alinalfardan/",
      },
    ],
  },
  {
    imageUrl: "https://i.pravatar.cc/150?img=60",
    name: "Dr. John Williams",
    position: "General Practitioner",
    description: "With a focus on preventive care, Dr. Williams ensures patients maintain optimal health through regular checkups and personalized treatment plans.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/alinalfardan/",
      },
    ],
  },
  {
    imageUrl: "https://i.pravatar.cc/150?img=36",
    name: "Dr. Ashley Thompson",
    position: "Pediatrician",
    description: "Dr. Thompson is dedicated to the health and well-being of children, offering expert care from infancy through adolescence.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/alinalfardan/",
      },
    ],
  },
  {
    imageUrl: "https://i.pravatar.cc/150?img=17",
    name: "Dr. Bruce Anderson",
    position: "Orthopedic Surgeon",
    description: "Dr. Anderson provides advanced treatment for musculoskeletal conditions, helping patients regain mobility and improve quality of life.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/alinalfardan/",
      },
    ],
  },
];


export const Team = () => {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin":
        return <Linkedin size="20" />;
    }
  };

  return (
    <section
      id="team"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Our Dedicated{" "}
        </span>
        Doctors
      </h2>

      <p className="mt-4 mb-10 text-xl text-muted-foreground">
        Meet our team of dedicated healthcare professionals. Each doctor brings a wealth of expertise and a passion for providing top-quality care to our patients.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10">
        {teamList.map(
          ({ imageUrl, name, position, socialNetworks, description }: TeamProps) => (
            <Card
              key={name}
              className="bg-muted/50 relative mt-8 flex flex-col justify-center items-center"
            >
              <CardHeader className="mt-8 flex justify-center items-center pb-2">
                <img
                  src={imageUrl}
                  alt={`${name} ${position}`}
                  className="absolute -top-12 rounded-full w-24 h-24 aspect-square object-cover"
                />
                <CardTitle className="text-center">{name}</CardTitle>
                <CardDescription className="text-primary">
                  {position}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-2">
                <p>{description}</p>
              </CardContent>

              <CardFooter>
                {socialNetworks.map(({ name, url }: SociaNetworkslProps) => (
                  <div key={name}>
                    <a
                      rel="noreferrer noopener"
                      href={url}
                      target="_blank"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <span className="sr-only">{name} icon</span>
                      {socialIcon(name)}
                    </a>
                  </div>
                ))}
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
