import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { FaqItem } from "@/types/service";

const Faq = ({className, title, faq}:{className?: string, title?: string, faq : FaqItem[]}) => {
   return (
    <section className={cn("w-full p-4 border rounded-2xl", className)}>
      {title &&  <h6 className="!text-xl mb-4">About {title}</h6>}
      <Accordion type="single" collapsible className="flex flex-col gap-2">
        {faq.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="bg-neutral-50 dark:bg-neutral-900/50 px-2 lg:px-4 border-b-0">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="px-2 lg:px-4 mt-4">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default Faq;
