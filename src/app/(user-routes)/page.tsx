import { ZoomIn } from "@/components/animation/zoom";
import Footer from "@/components/footer";
import HomeBlogs from "@/components/home-blogs";
import HomeServices from "@/components/home-services";
import HomeStickyScroller from "@/components/home-sticky-scroller";
import Testimonial from "@/components/home-testimonials";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findBlogs } from "@/lib/data/blogs";
import { findServices } from "@/lib/data/services";
import { homeService } from "@/lib/data/static-data";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon, Award, BadgeCheck, Check, Shield } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ClientComplaintsTable } from "@/components/clientComplaintsTable";
import { AnnualDisposalTable } from "@/components/annualDisposalTable";
export const dynamic = "force-dynamic";


export default async function Home() {

   const [services, blogs] = await Promise.all([
      findServices(),
      findBlogs({ take: 10 }),
   ]);

   const filteredServices = services
    .filter((service) => {
       // Filter by type if type is set and not ALL
       if (service.type !== 'PLATINA_WEALTH' && 
          service.type !== 'RESEARCH_ADVISORY_MUTUAL_FUNDS' && 
          service.type !== 'COMBO') return true;
       return false;
    })
    .slice(0, 6); // Limit to 6 services


   const builtToGrow = [
      {
         icon : '/home/gems.png',
         title: 'Hidden Gems Discovery',
         description: 'Identifying niche opportunities before they become market favorites.',
         color: 'bg-yellow-100/50 dark:bg-fuchsia-200/5'
      },
      {
         icon : '/home/research.png',
         title: 'Deep Research Foundation',
         description: 'In-Depth Analysis that transforms data into decisive opportunities.',
         color: 'bg-pink-100/50 dark:bg-indigo-300/5'
      },
      {
         icon : '/home/techno-funda.png',
         title: 'Techno-Funda Edge',
         description: 'Blending technical momentum with fundamental strength for precise entries.',
         color: 'bg-blue-100/50 dark:bg-rose-200/5'
      },
      {
         icon : '/home/trend.png',
         title: 'Trend Mapping',
         description: 'Tracking emerging sectors and market themes shaping future growth.',
         color: 'bg-green-100/50 dark:bg-cyan-200/5'
      },
   ]

   const categories = [
      { label: "Mutual Funds", type: "RESEARCH_ADVISORY_MUTUAL_FUNDS" },
      { label: "Smallcase", type: "SMALLCASE" },
      { label: "Research Advisory", type: "RESEARCH_ADVISORY" },
      { label: "Portfolio Review", type: "PORTFOLIO_REVIEW" },
   ];
   return (
      <main className="w-full relative px-5 lg:px-10 xl:px-24">
         {/* Hero Section */}
         <section className="relative w-full pt-12 -mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-0">
               <div className="space-y-8 flex-1 lg:h-full flex flex-col order-1">
                  <h6 className="self-start inline-block text-legacisPurple dark:text-legacisGreen tracking-wide text-sm xl:text-lg rounded-lg shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 py-1">Research-Led. Risk-Aware. Built To Compound</h6>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-nowrap leading-10 lg:leading-18 xl:leading-20 flex flex-col items-start">
                     Turn Your Investments 
                     <span>
                        into Opportunities
                     </span>
                  </h1>
                  <p className="text-sm lg:text-lg">From in-depth research to discovering market’s hidden opportunities, we help you invest with confidence and aim for enduring growth.</p>
                  <Button asChild variant={'default'} className="max-w-80 shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 font-normal text-base sm:text-xl h-auto py-3 rounded-sm w-full">
                     <Link href={'/services'} className="gap-4 hover:!text-white dark:hover:!text-neutral-800">
                         Explore Plans
                     </Link>  
                  </Button>
               </div>
               <div className="flex flex-col flex-1 relative items-center order-3 md:order-2 justify-center w-full sm:w-auto">
                  <div className="flex-1 flex flex-col gap-2 w-full sm:max-w-md justify-center">
                     {homeService.map((item, index) => (
                        <ZoomIn
                           key={index}
                           delay={index * 0.1}
                           className={cn(
                           "flex w-full  ",
                           index % 2 === 0
                              ? "justify-start"
                              : "justify-end"
                           )}
                        >
                           <Button
                           asChild
                           variant="outline"
                           className={cn(
                              "w-full max-w-80 py-5 border-8 shadow-lg border-neutral-50  text-base text-neutral-800 dark:text-neutral-800 h-auto flex items-center justify-between gap-4 rounded-lg",
                              item.tw
                           )}
                           >
                           <Link href={item.link} className="flex items-center w-full">
                              <Image
                                 src={item.icon}
                                 alt="hero"
                                 width={36}
                                 height={36}
                              />
                              <span>{item.name}</span>
                              <ArrowUpRightIcon className="inline-block w-4 h-4" />
                           </Link>
                           </Button>
                        </ZoomIn>
                     ))}
                  </div>

               </div>
            
               <div className="w-full md:col-span-2 py-4 flex flex-col lg:flex-row order-2 md:order-3 items-start justify-between gap-4 lg:gap-8 mt-4">
                  <div className="flex flex-wrap gap-4">
                        <div className="flex items-end gap-2 rounded-full hover:scale-[1.01] backdrop-blur-xs transition-all duration-300 ease-in-out border border-neutral-100 dark:border-neutral-700 px-4 py-2 font-medium w-72">
                           <span className="flex items-baseline gap-1">
                              <NumberTicker
                                 value={100}
                                 className="whitespace-pre-wrap text-2xl font-medium tracking-tighter text-black dark:text-white"
                              />
                               k +
                           </span> 
                           Community Members
                        </div>
                        <Link href={"https://x.com/raghavwadhwa"} target="_blank">
                           <div className="flex items-end gap-2 hover:scale-[1.01] backdrop-blur-xs transition-all duration-300 ease-in-out rounded-full border border-neutral-100 dark:border-neutral-700 px-4 py-2 font-medium">
                              <Image
                                 src="/raghav-wadhwa.jpg"
                                 alt="Raghav Wadhwa"
                                 width={38}
                                 height={38}
                                 className="rounded-full border "
                              />
                              Raghav Wadhwa
                           </div>
                        </Link>
                  </div>
                  <div className="flex items-center flex-wrap lg:flex-nowrap gap-4 w-full max-w-3xl">
                     <div className="font-medium p-2 h-36 w-full sm:w-56 xl:w-60 flex flex-col items-center justify-center gap-4 border px-4 backdrop-blur-sm rounded-xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
                        <BadgeCheck className="w-8 h-8 text-green-600" aria-label="SEBI Registered" />                     
                        <div className="flex flex-col items-center ">
                           <span className="text-center">
                              SEBI Registered
                           </span>
                           <span className="text-center text-xs mt-1 text-nowrap">
                              <span className="flex items-center gap-1">
                                 <Check size={20} className="text-green-600"/>
                                 Investment Advisor
                              </span>
                              <span className="flex items-center gap-1">
                                 <Check size={20} className="text-green-600"/>
                                 Research Analyst
                              </span>
                           </span>
                   
                        </div>
                     </div>
                     <div className="font-medium p-2 h-36 w-full sm:w-56 xl:w-60 flex flex-col items-center justify-center gap-4 border px-4 backdrop-blur-sm rounded-xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
                        <Award className="w-8 h-8 text-blue-600" aria-label="AUM" />   
                        <div className="flex items-center justify-center gap-2 w-full">
                           <span className="flex items-baseline gap-2">
                              <NumberTicker
                                 value={10}
                                 className="whitespace-pre-wrap text-4xl font-medium tracking-tighter text-black dark:text-white"
                              />
                              +
                           </span>  
                           <span className="text-center">
                              Years of Experience
                           </span>
                        </div>
                     </div>
                     <div className="font-medium p-2 h-36 w-full sm:w-56 xl:w-60 flex flex-col items-center justify-center gap-4 border px-4 backdrop-blur-sm rounded-xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
                        <Shield className="w-8 h-8" aria-label="AUM" />   
                        <div className="flex items-center gap-2 w-full">
                           <span className="flex items-baseline gap-2">
                              <NumberTicker
                                 value={2500}
                                 className="whitespace-pre-wrap text-4xl font-medium tracking-tighter text-black dark:text-white"
                              />
                           +
                           </span>  
                           <span className="text-center text-sm xl:text-base">
                              Satisfied investors
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Circles */}
            <div className="rounded-full blur-xs bg-legacisGreen dark:bg-blue-200 -z-10 h-40 w-40 sm:h-60 sm:w-60 opacity-10 dark:opacity-50 absolute bottom-[30%] right-[50%] sm:bottom-44 sm:right-[2%]" >
               <div className=" items-center h-full w-full relative">
                     <Image
                        src="/icons/favicon.ico"
                        alt="Legacis Logo"
                        fill
                        className="opacity-20 dark:hidden"
                        style={{
                           objectFit: "cover"
                        }}
                     />
               </div>
            </div>
            <div className="rounded-full blur-xs bg-legacisGreen dark:bg-blue-200 -z-10 h-20 w-20 opacity-10 dark:opacity-50 absolute bottom-[40%] right-4 sm:bottom-44 sm:right-[30%]" >
               <div className=" items-center h-full w-full relative">
                     <Image
                        src="/icons/favicon.ico"
                        alt="Legacis Logo"
                        fill
                        className="opacity-20 dark:hidden"
                        style={{
                           objectFit: "cover"
                        }}
                     />
               </div>
            </div>
            <div className="rounded-full blur-xs bg-legacisGreen dark:bg-blue-200 -z-10 h-24 w-24 sm:h-40 sm:w-40 opacity-10 dark:opacity-50 absolute bottom-[60%] right-1/3 sm:bottom-60 sm:right-[35%]" >
               <div className=" items-center h-full w-full relative">
                     <Image
                        src="/icons/favicon.ico"
                        alt="Legacis Logo"
                        fill
                        className="opacity-20 dark:hidden"
                        style={{
                           objectFit: "cover"
                        }}
                     />
               </div>
            </div>
            <div className="rounded-full blur-xs bg-legacisGreen dark:bg-blue-200 -z-10 h-24 w-24 md:h-36 md:w-36 opacity-10 dark:opacity-50 absolute top-4 sm:top-10 sm:right-[15%]" >
               <div className=" items-center h-full w-full relative">
                     <Image
                        src="/icons/favicon.ico"
                        alt="Legacis Logo"
                        fill
                        className="opacity-20 dark:hidden"
                        style={{
                           objectFit: "cover"
                        }}
                     />
               </div>
            </div>
   
         </section>

         {/* Built to grow section  */}
         <section className="py-16 lg:py-24 flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-6">
               <h6 className="inline-block rounded-lg shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 py-1 text-legacisPurple dark:text-legacisGreen font-medium xl:text-2xl">Built to Grow</h6>
               <h2 className="text-2xl lg:text-5xl font-medium leading-8 sm:leading-14 text-neutral-800 dark:text-neutral-200">
                  Why Legacis is the Right <br />Platform for Your Investments
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-20 items-center justify-center justify-items-center">
                  {builtToGrow.map((item, index) => (
                     <ZoomIn key={index} delay={index * 0.1} className={cn("flex flex-col sm:max-w-72 items-center justify-center gap-10 min-h-80 p-8 rounded-xl shadow-2xl bg-", item.color)}>
                        <Image
                           src={item.icon}
                           alt={item.title}
                           width={60}
                           height={60}
                           className="dark:grayscale dark:invert"
                        />
                        <div className="flex flex-col items-center text-center gap-4">
                           <h6 className=" text-lg lg:text-xl font-semibold">{item.title}</h6>
                           <p className="text-sm ">{item.description}</p>
                        </div>
                     </ZoomIn>
                  ))}
               </div>
            </div>
         </section>

         {/* Scroller sticky section */}
          <section className="w-full  py-16 my-16 rounded-2xl">
            <HomeStickyScroller />
          </section>
     
         {/* Services */}
         <section className="py-16 lg:py-24 flex flex-col items-center justify-center h-full">
            <h6 className="rounded-lg shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 py-1 text-legacisPurple dark:text-legacisGreen font-medium xl:text-2xl">Services</h6>
            <h2 className="text-2xl my-4 lg:text-5xl font-medium leading-10 sm:leading-14 text-neutral-800 dark:text-neutral-200">
              Our Portfolio at a Glance
            </h2>
            <Tabs defaultValue={"all"} className="mt-8 ">
               <TabsList className="p-2 sm:p-4 h-auto sm:h-16 flex flex-wrap items-center gap-2 sm:gap-4">
                  <TabsTrigger value="all" asChild className="text-sm sm:text-lg flex-shrink-0 p-2 sm:p-4">
                     <Link href="/services">All</Link>
                  </TabsTrigger>
                  {categories.map((cat) => (
                     <TabsTrigger key={cat.type} value={cat.type} asChild className="text-sm sm:text-lg flex-shrink-0 p-2 sm:p-4">
                     <Link href={`/services?type=${encodeURIComponent(cat.type)}`}>{cat.label}</Link>
                     </TabsTrigger>
                  ))}
               </TabsList>
            </Tabs>
            <HomeServices services={filteredServices}/>
         </section>
         
         {/* Testimonials */}
         <section className="px-4 py-16 lg:py-24 flex flex-col items-center justify-center h-full bg-neutral-100 dark:bg-zinc-900 rounded-2xl">
            <Testimonial/>
         </section>
         {/* Recent Blogs  */}
         <section className="px-4 py-16 lg:py-24 flex flex-col items-center justify-center h-full bg-neutral-100 dark:bg-neutral-800 rounded-2xl mt-16">
            <h6 className="inline-block rounded-lg shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 py-1 text-legacisPurple dark:text-legacisGreen font-medium xl:text-2xl">Blogs</h6>
            <HomeBlogs blogs={blogs} />
         </section>

         {/* Tables */}
          <section className="py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
             <div className="w-full">
                 <h5 className="mb-4 text-lg font-medium">Number of Client Complaints</h5>
                 <ClientComplaintsTable />
             </div>
             <div className="w-full">
               <h5 className="mb-4 text-lg font-medium">Trend of Annual Disposal of Complaints</h5>
               <AnnualDisposalTable />
             </div>

         </section>

         <Footer className="pt-0 lg:pt-0  px-0 lg:px-0 xl:px-0" />
      </main>
   )
}