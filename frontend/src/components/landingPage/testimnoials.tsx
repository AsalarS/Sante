import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://i.pravatar.cc/150?img=68",
    name: "Sophia Johnson",
    userName: "@sophia_johnson",
    comment: "The online appointment scheduling feature is a game-changer! It saved me so much time and hassle.",
  },
  {
    image: "https://i.pravatar.cc/150?img=69",
    name: "Michael Brown",
    userName: "@michael_brown",
    comment: "I’ve never felt more cared for. The doctors are attentive, and the platform is so easy to use.",
  },
  {
    image: "https://i.pravatar.cc/150?img=70",
    name: "Emily Davis",
    userName: "@emily_davis",
    comment: "The live chat allowed me to consult a specialist from the comfort of my home. Highly recommend!",
  },
  {
    image: "https://i.pravatar.cc/150?img=3",
    name: "James Wilson",
    userName: "@james_wilson",
    comment: "From booking appointments to accessing my health records, everything is seamless and secure. Great job!",
  },
  {
    image: "https://i.pravatar.cc/150?img=34",
    name: "Olivia Martinez",
    userName: "@olivia_martinez",
    comment: "The system is intuitive and user-friendly. It made managing my health so much easier.",
  },
  {
    image: "https://i.pravatar.cc/150?img=12",
    name: "Liam Anderson",
    userName: "@liam_anderson",
    comment: "The level of care and attention from the healthcare providers is unmatched. Highly satisfied!",
  },
];


export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        Discover Why
        <span className="bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Users Love{" "}
        </span>
        Santé
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Hear what our patients have to say about their experiences with our healthcare system. We take pride in delivering top-notch services that make a difference.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden bg-background border border-border"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={image}
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
