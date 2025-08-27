"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { saveContactMessage } from "@/actions/contactForm";
import { toast } from "sonner";

const ContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

    // Generate a simple math captcha
  // Generate captcha only on client
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);

  useEffect(() => {
    setA(Math.floor(Math.random() * 10) + 1);
    setB(Math.floor(Math.random() * 10) + 1);
  }, []);


  const form = useForm<ContactFormValues & { captcha: string }>({
    resolver: zodResolver(
      ContactSchema.extend({
        captcha: z.string().refine(val => Number(val) === a + b, {
          message: "Incorrect answer",
        }),
      })
    ),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      captcha: "",
    },
  });

   const onSubmit = async (values: ContactFormValues) => {
   try {
      const response = await saveContactMessage({
         name: values.name,
         email: values.email,
         phone: values.phone,
         message: values.message,
      });
      if (!response?.success) {
         toast.error("Failed to send message. Please try again later.");
         return;
      }
      toast.success("Message sent successfully!");
      setSubmitted(true);
      form.reset();
   } catch (error) {
      toast.error("Failed to send message. Please try again later.");
   }
   };

  if (submitted) {
    return (
      <Card className="shadow-none border-0 max-w-md w-full rounded-xl p-4 flex flex-col items-center justify-center dark:bg-neutral-800">
        <div className="flex items-center gap-2 mb-4">
          <Check size={24} className="text-green-500" />
          <CardTitle className="text-nowrap">Thank You!</CardTitle>
        </div>
        <CardContent>
          <p className="text-center text-base">
            Your message has been received.<br />
            Our team will reach out to you shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md w-full rounded-xl p-4 dark:bg-neutral-800 shadow-2xl shadow-neutral-200 dark:shadow-neutral-900">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Your phone number" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Type your message here..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      <FormField
          control={form.control}
          name="captcha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What is {a} + {b}?
              </FormLabel>
              <FormControl>
                <Input placeholder="Your answer" className="border rounded-md w-auto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant={'secondary'} className="w-full dark:bg-neutral-500">
          Send Message
        </Button>
      </form>
    </Form>
  );
}