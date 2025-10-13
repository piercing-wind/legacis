import ContactForm from "@/components/contactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, LifeBuoy } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Legacis Capital, your trusted partner in financial services.",
};

export default function ContactPage() {
  return (
    <section className="w-full px-5 lg:px-10 xl:px-24 py-8 flex flex-col md:flex-row justify-center gap-8">
      
      <Card className="shadow-none border-0 dark:bg-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <Mail className="text-primary" size={20} />
            <span className="">info@legaciscapital.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-primary" size={20} />
            <span className="">+91 97797 74529, +91 99151 56561</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary" size={20} />
            <span className="">
               31-A, Race Course Rd, Basant Avenue, White Avenue, Amritsar, Punjab 143001
            </span>
          </div>
          <div className="my-2 border-b border-dashed w-full"/>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="border rounded-xl p-4 flex flex-col flex-1 min-w-64 h-32">
              <h6 className="xl:text-xl opacity-80 font-medium mb-2">
                Investment Advisory - IA Support Mail
              </h6>
              <div className="flex items-center gap-3 mt-auto">
                <LifeBuoy className="text-primary opacity-75 " size={20}/>
                <span className="">help.ia@legaciscapital.com</span>
              </div>
            </div>
            <div className="border rounded-xl p-4 flex flex-col flex-1 min-w-64 h-32">
              <h6 className="xl:text-xl opacity-80 font-medium mb-2">
                Research Advisory - RA Support Mail
              </h6>
              <div className="flex items-center gap-3 mt-auto">
                <LifeBuoy className="text-primary opacity-75 " size={20}/>
                <span className="">help.ra@legaciscapital.com</span>
              </div>
            </div>
          </div>

          <div className="my-2 border-b border-dashed w-full"/>

          <div>
            <h6 className="xl:text-xl opacity-80 font-medium mb-2">Compliance Officer:</h6>
            <div className="p-4 border rounded-xl max-w-sm flex flex-col gap-2">
              <span className="font-medium">Raghav Wadhwa</span>
              <span className="flex items-center gap-2 text-sm"><Mail size={12}/>raghav@legaciscapital.com</span>
              <span className="flex items-center gap-2 text-sm"><Mail size={12}/>raghav@samarwealth.com</span>
              <span className="flex items-center gap-2 text-sm"><Phone size={12}/>+91 98880 13123</span>
              
            </div>
          
          </div>

        </CardContent>
      </Card>
      <ContactForm />
    </section>
  );
}