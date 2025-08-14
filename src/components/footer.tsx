import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Linkedin, Twitter, Instagram, Facebook, Youtube, MapPin, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

const Footer = ({className}:{className?:string}) => {
  return (
   <footer className={cn(`pt-4 lg:pt-8  px-4 lg:px-10 xl:px-24`, className)}>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-start justify-between px-1'>
         <div className='max-w-sm h-full col-span-2'>
            <Link href="/" className="relative block w-60 h-20 -mt-4">
               <Image
                  src="/legacis-logo-black.png"
                  alt="Legacis Logo"
                  fill
                  className="object-contain dark:hidden"
                  priority
               />
               <Image
                  src="/legacis-logo-white.png"
                  alt="Legacis Logo"
                  fill
                  className="object-contain hidden dark:block"
                  priority
               />
            </Link>
            <div className='-mt-2 ml-4 text-sm text-neutral-600 dark:text-neutral-300 border-b pb-4 sm:border-b-0 sm:pb-0'>
               <p className='!text-neutral-500 dark:!text-neutral-300'>Invest Smart, Grow Steady.</p>
                  <div className='flex flex-col gap-2 mt-8'>
                     <Link href={'mailto:info@legaciscapital.com'} className='flex gap-4'><Mail size={20}/> info@legaciscapital.com </Link>
                     <Link href={'tel:+919779774529'} className='flex gap-4'><Phone size={20}/> +91 97797 74529 </Link>
                  </div>
               
               <p className='!text-neutral-500 dark:!text-neutral-300 text-sm mt-8 pt-4 sm:pt-0'>Follow us on:</p>
               
               <div className='flex items-center gap-4 mt-2 '>
                  <Link href="https://www.linkedin.com/company/legacis/" target="_blank" rel="noopener noreferrer" className='text-neutral-600 dark:text-neutral-300 hover:text-legacisPurple dark:hover:text-legacisGreen transition-colors flex items-center gap-1'>
                    <Linkedin size={20}/>
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                  <Link href="https://twitter.com/legacis" target="_blank" rel="noopener noreferrer" className='text-neutral-600 dark:text-neutral-300 hover:text-legacisPurple dark:hover:text-legacisGreen transition-colors flex items-center gap-1'>
                    <Twitter size={20}/>
                    <span className="sr-only">Twitter</span>
                  </Link>
                  <Link href="https://www.instagram.com/legacis/" target="_blank" rel="noopener noreferrer" className='text-neutral-600 dark:text-neutral-300 hover:text-legacisPurple dark:hover:text-legacisGreen transition-colors flex items-center gap-1'>
                    <Instagram size={20}/>
                    <span className="sr-only">Instagram</span>
                  </Link>
                  <Link href="https://www.facebook.com/legacis" target="_blank" rel="noopener noreferrer" className='text-neutral-600 dark:text-neutral-300 hover:text-legacisPurple dark:hover:text-legacisGreen transition-colors flex items-center gap-1'>
                    <Facebook size={20}/>
                    <span className="sr-only">Facebook</span>
                  </Link>
                  <Link href="https://www.youtube.com/@legacis" target="_blank" rel="noopener noreferrer" className='text-neutral-600 dark:text-neutral-300 hover:text-legacisPurple dark:hover:text-legacisGreen transition-colors flex items-center gap-1'>
                    <Youtube size={20}/>
                    <span className="sr-only">YouTube</span>
                  </Link>
               </div>
            </div>
         </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16 col-span-3 sm:px-4'>
         <div className='flex flex-col gap-4 text-sm px-4 sm:px-0'>
            <span className='text-lg font-semibold'>Services</span>
            <Link href="/services?type=RESEARCH_ADVISORY" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Equity Direct</Link>
            <Link href="/services?type=SMALLCASE" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Equity Smallcase</Link>
            <Link href="/services?type=RESEARCH_ADVISORY_MUTUAL_FUNDS" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Mutual Funds</Link>
            <Link href="/services?type=PORTFOLIO_REVIEW" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Portfolio Review</Link>
            <Link href="/services?type=PLATINA_WEALTH" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Platina Wealth - HNI</Link>
         </div>
         <div className='flex flex-col gap-4 text-sm px-4 sm:px-0'>
            <span className='text-lg font-semibold'>Quick Links</span>
            <Link href="/" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Home</Link>
            <Link href="/about" className='text-neutral-600 dark:text-neutral-300 hover:underline'>About Us</Link>
            <Link href="/contact" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Contact</Link>
            <Link href="/services" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Services</Link>
            <Link href="/blog" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Blogs</Link>
         </div>
         <div className='flex flex-col col-span-2 sm:col-span-1 gap-4 text-sm px-4 sm:px-0'>
            <span className='text-lg font-semibold'>Company</span>
            <Link href="/about#our-team" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Your Team</Link>
            <Link href="/privacy-policy" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Privacy Policy</Link>
            <Link href="/terms-and-conditions" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Terms & Conditions</Link>
            <Link href="/disclosure-ia" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Disclosure - IA</Link>
            <Link href="/disclosure-ra" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Disclosure - RA</Link>
            <Link href="/grievance-redressal" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Grievance Redressal</Link>
            <Link href="/investor-charter" className='text-neutral-600 dark:text-neutral-300 hover:underline'>Investor Charter</Link>
         </div>
         </div>
      </div>

      <div className='w-full px-4 md:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4 my-4 mt-12 place-items-start justify-items-center'>
         <div className='flex flex-col items-start gap-2 w-full'>
            <p className='text-xs flex items-center gap-1'>Company Name: <span className='font-medium'>Samar Wealth Advisors</span></p>
            <p className='text-xs flex items-center gap-1'>Registration Type: <span className='font-medium'>Partnership</span></p>
            <p className='text-xs flex items-start gap-1'>
               <MapPin size={16} className='text-neutral-600 dark:text-neutral-300' />
               31-A, Race Course Rd, Basant Avenue, White Avenue, <br /> Amritsar, Punjab 143001</p>
         </div>
         <div className='flex flex-col gap-2 w-full'>
            <p className='text-xs'>SEBI Registered Investment Advisor Reg No: <span className='font-semibold'>INA000019345</span></p>
            <p className='text-xs'>BSE Enlistment No: <span className='font-semibold'>2187</span></p>
            <p className='text-xs'>(Regn Date: <span className='font-semibold'>July 01, 2024</span>) </p>
            <p className='text-xs'>SEBI Registered Research Analyst Reg No: <span className='font-semibold'>INH000018036</span></p>
            <p className='text-xs'>BSE Enlistment No: <span className='font-semibold'>6345</span></p>
            <p className='text-xs'>(Regn Date: <span className='font-semibold'>Aug 01, 2024</span>) </p>
         </div>
         <div className='flex flex-col gap-2 w-full'>
            <p className='text-xs'>The information provided by Legacis Capital through its website is for informational and educational purposes only and is not a solicitation to buy any of our products.</p>
            <p className='text-xs'>Past performance, registration granted by SEBI and Membership of BASL does not guarantee the future performance by any means. Investment in equities is subject to market risks. Notwithstanding all the efforts to do best research, clients should understand that investing in equities involves a risk of loss of both income and principal. Please ensure that you understand fully the risks involved.</p>
       
         </div>
      </div>

      <div className="w-full relative z-10 mt-12 border-t pt-6 py-8">
        <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-purple-400 dark:bg-purple-600 max-w-xl w-full h-44 rounded-full blur-3xl opacity-20 dark:opacity-5 mx-auto" />
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-2 text-sm relative z-10">
          <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300">
            © {new Date().getFullYear()} Legacis. All rights reserved.
          </span>
          <span className='text-xs sm:text-sm gap-1 text-neutral-500 dark:text-neutral-300 flex items-start'>
            <Link href={'/'}>Legacis</Link>
            <span className=" mx-2">|</span>
            <Link href={'https://byteswithbits.com'} target="_blank" className='flex items-center flex-col sm:flex-row'>
              Designed Developed & Hosted By &nbsp;
              <span className="font-medium text-legacisPurple dark:text-legacisGreen">
                Bytes with Bits
              </span>
            </Link>
          </span>
        </div>
      </div>
   </footer>
  )
}

export default Footer