import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { Sponsors } from "./Sponsors";
  
  interface FAQProps {
    question: string;
    answer: string;
    value: string;
  }
  
  const FAQList: FAQProps[] = [
    {
      question: "Is this system HIPAA compliant?",
      answer: "Yes. Our platform is fully HIPAA compliant to ensure your health data remains secure and private.",
      value: "item-1",
    },
    {
      question: "How do I access my medical records?",
      answer: "You can easily access your medical records by logging into your account and navigating to the 'Appointments' section.",
      value: "item-2",
    },
    {
      question: "Can I schedule appointments with any doctor?",
      answer: "Yes, you can schedule appointments with any available doctor through our receptionists.",
      value: "item-3",
    },
    {
      question: "How do I update my personal information?",
      answer: "To update your personal information, click on your profile icon.",
      value: "item-4",
    },
    {
      question: "Is there a mobile app for this platform?",
      answer: "Currently, the platform is web-based. However, we are working on releasing a mobile app for both iOS and Android soon.",
      value: "item-5",
    },
    {
      question: "How do I contact support if I have an issue?",
      answer: "You can reach our support team through the 'Contact Us' page, or directly by emailing support@sante.com.",
      value: "item-6",
    },
    {
      question: "Are my health records shared with other healthcare providers?",
      answer: "Your health records are shared with authorized providers only, based on your consent and the regulations of your healthcare plan.",
      value: "item-7",
    },
  ];
  
  
  export const FAQ = () => {
    return (
      <section
        id="faq"
        className="container py-24 bg-background"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Frequently Asked{" "}
          <span className="bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            Questions
          </span>
        </h2>
  
        <Accordion
          type="single"
          collapsible
          className="w-full AccordionRoot"
        >
          {FAQList.map(({ question, answer, value }: FAQProps) => (
            <AccordionItem
              key={value}
              value={value}
              className="text-foreground"
            >
              <AccordionTrigger className="text-left hover:underline">
                {question}
              </AccordionTrigger>
  
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-12 text-foreground">
          Need more help?{" "}
          <span className="bg-linear-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            
            Contact Us
          </span>
        </h2>

        <Sponsors />
      </section>
    );
  };