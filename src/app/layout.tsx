import type { Metadata } from "next";
import { Poppins , Urbanist} from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/reduxStateProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import { Authentication } from "@/components/auth/authentication";
import { SessionProvider } from "next-auth/react";
import Modal from "@/components/profile/modal";

const poppins = Poppins({
   weight : [ "100", "200", "300", "400", "500", "600", "700", "800", "900"],
   variable: "--font-poppins",
   subsets: ["latin"],
});

const urbanist = Urbanist({
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
      default: "Legacis Capital",
      template: "%s - Legacis",
  },
  description: "Financial services and investment solutions for the modern world.",
  twitter: {
      card: "summary_large_image",
      title: "Legacis Capital",
  },
  openGraph:{
      title: "Legacis Capital",
      description: "Financial services and investment solutions for the modern world.",
      url: "https://legaciscapital.com",
      type: "website",
      locale: "en_US",
      siteName: "Legacis Capital",
      images: ['/opengraph-image.jpg'],
  },
  generator: 'Bytes with Bits',
  applicationName: 'Legacis Capital',
  referrer: 'origin-when-cross-origin',
  keywords: ['Samar Wealth', 'Raghav Wadhwa', 'Legacis Capital', 'Investment', 'Financial Services', 'Portfolio Management'],
  authors: [{ name: 'Sourabh Sharma' , url: 'https://www.linkedin.com/in/sourabh-sharma-8987451a2/' }],
  creator: 'CA Raghav Wadhwa | Samar wealth | Legacis Capital',
  metadataBase: new URL('https://legaciscapital.com'),
  alternates: {
   canonical: '/',
   languages: {
      'en-US': '/en-US',
   },
  },
  robots: {
   index: true,
   follow: true,
   nocache: false,
   googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
   },
  },
  icons: {
   icon: '/icon.png',
   shortcut: '/shortcut-icon.png',
   apple: '/apple-icon.png',
   other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
   },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${urbanist.variable} antialiased relative`}
      >
         <ThemeProvider 
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            >
           <SessionProvider> 
            <ReduxProvider>
               <Authentication />
               <Modal />
               {children}
               <Toaster />
            </ReduxProvider>
          </SessionProvider>
         </ThemeProvider>

      </body>
    </html>
  );
}
