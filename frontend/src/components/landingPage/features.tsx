import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import imageRecord from "../../assets/nurseStanding.png";
import imageCommunication from "../../assets/receptionistImage.png";
import imageReceptionist from "../../assets/communcationImage.png";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Patient Records Management",
    description:
      "Easily store, access, and manage patient records securely with real-time updates and robust data protection.",
    image: imageRecord,
  },
  {
    title: "Appointment Scheduling",
    description:
      "A streamlined system for booking and managing appointments, ensuring efficient time management for patients and staff.",
    image: imageReceptionist,
  },
  {
    title: "Secure Communication",
    description:
      "Facilitate safe and encrypted communication between patients and healthcare providers.",
    image: imageCommunication,
  },
];

const featureList: string[] = [
  "Patient dashboard",
  "Appointment management",
  "Responsive design",
  "Multi-user roles",
  "Encrypted communication",
];


export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center text-foreground">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge
              variant="secondary"
              className="text-sm"
            >
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title} className="bg-background">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className=" h-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
