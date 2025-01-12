import { Instagram, Linkedin, Mail, Phone } from "lucide-react";

interface SponsorProps {
  icon: JSX.Element;
  name: string;
}

const sponsors: SponsorProps[] = [
  {
    icon: <Mail size={34} />,
    name: "support@sante.com",
  },
  {
    icon: <Phone size={34} />,
    name: "+123 456 7890",
  },
  {
    icon: <Instagram size={34} />,
    name: "@health_system_official",
  },
  {
    icon: <Linkedin size={34} />,
    name: "HealthSystem Official",
  },
];

export const Sponsors = () => {
  return (
    <section
      id="sponsors"
      className="container pt-24"
    >
      {/* <h2 className="text-left text-md lg:text-xl font-bold mb-8 text-primary">
        Investors and founders
      </h2> */}

      <div className="flex flex-wrap justify-left items-center gap-4 md:gap-8">
        {sponsors.map(({ icon, name }: SponsorProps) => (
          <div
            key={name}
            className="flex items-center gap-1 text-muted-foreground/60"
          >
            <span>{icon}</span>
            <h3 className="text-xl  font-bold ml-2">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};