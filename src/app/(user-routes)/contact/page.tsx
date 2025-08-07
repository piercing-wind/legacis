import ContactForm from "@/components/contactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
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
            <Mail className="text-primary" />
            <span className="text-base">support@legacis.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-primary" />
            <span className="text-base">+91 97797 74529, +91 99151 56561</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary" />
            <span className="text-base">
               31-A, Race Course Rd, Basant Avenue, White Avenue, Amritsar, Punjab 143001
            </span>
          </div>
        </CardContent>
      </Card>
      <ContactForm />
    </section>
  );
}