import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import doctor from "../../assets/doctorStanding.png";
import { Archive, CalendarCheck2, ChartNoAxesCombined } from "lucide-react";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}


const serviceList: ServiceProps[] = [
  {
    title: "Electronic Health Records",
    description:
      "Securely store and access comprehensive patient health records, ensuring accurate and up-to-date information for providers.",
    icon: <Archive />,
  },
  {
    title: "Appointment Scheduling",
    description:
      "Simplify booking, rescheduling, and managing appointments with an intuitive and efficient system.",
    icon: <CalendarCheck2 />,
  },
  {
    title: "Health Analytics",
    description:
      "Analyze patient data to generate actionable insights and improve care outcomes with advanced analytics tools.",
    icon: <ChartNoAxesCombined />,
  },
];

export const Services = () => {
  return (
    <section className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            <span className="bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              User-Centric{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Our services are designed to streamline healthcare operations, ensuring efficiency, security, and better patient outcomes.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title} className="bg-background">
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/10 p-8 rounded-2xl text-foreground/70">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <img
          src={doctor}
          className="w-[100px] md:w-[200px] lg:w-[300px] object-contain"
          alt="About services"
        />
      </div>
    </section>
  );
};
