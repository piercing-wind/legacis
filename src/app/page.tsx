import { SliderRight } from "@/components/animation/slider";
import { ZoomIn } from "@/components/animation/zoom";
import Register from "@/components/auth/register";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
   return (
      <main className="w-full overflow-x-clip px-5 lg:px-10 xl:px-24 relative">
         <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full pt-8 -mt-4 lg:-mt-20">
            <div className="space-y-8 flex-1 h-full flex flex-col justify-center">
               <h6 className="uppercase text-legacisPurple dark:text-legacisGreen font-medium">Smarter Investments, Higher Returns</h6>
               <h1 className=" !text-3xl lg:!text-5xl text-nowrap leading-10 lg:leading-18 !font-medium lg:!font-normal">Turn Your Investments <br/>into Opportunities</h1>
               <p className="lg:text-lg">We combine deep research, smart strategies, and AIdriven insights to help you invest confidently and achieve consistent, long-term growth.</p>
               <Button className="mt-4 py-5 lg:max-w-72 w-full rounded shadow shadow-legacisGreen/20 uppercase text-lg bg-neutral-800 text-neutral-100 dark:text-neutral-100 hover:bg-legacisPurple/10">Invest Now</Button>
            </div>
            <div className="flex flex-col flex-1 w-full min-h-[60vh] lg:min-h-[80vh] relative items-end justify-evenly">
             <div className="absolute shrink-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rotate-90
                             lg:top-1/2 lg:left-auto lg:right-0 lg:translate-x-0 lg:-translate-y-1/2 lg:rotate-0">
               <div className="min-h-[43vh] lg:min-h-[80vh] min-w-sm lg:min-w-xl relative">
                 <Image
                   src="/hero-rectangle.svg"
                   alt="hero"
                   fill
                 />
               </div>
             </div>
             <div className="grid grid-cols-1 gap-6 w-full pl-4 md:pl-14 lg:pl-12 xl:pl-24 2xl:pl-40 pr-4 mt-8">
               <ZoomIn className="flex items-center gap-4 p-4 lg:p-6 rounded-sm bg-white/10 dark:bg-white/90 shadow-2xl max-w-72 w-full justify-self-start">
                  <Image
                     src="/mutual-fund-icon.svg"
                     alt="hero"
                     width={40}
                     height={40}
                  />
                  <div>
                     <h6 className="text-neutral-800 !text-sm lg:!text-lg">Mutual Funds</h6>
                     <p className="text-xs lg:text-sm !text-legacisBlue">Smarter stock picks</p>
                  </div>
               </ZoomIn>
               <ZoomIn delay={0.3} className="flex items-center gap-4 p-4 lg:p-6 rounded-sm bg-white/10 dark:bg-white/90 shadow-2xl max-w-72 w-full justify-self-end">
                  <Image
                     src="/equity-direct-service-icon.svg"
                     alt="hero"
                     width={40}
                     height={40}
                  />
                  <div>
                     <h6 className="text-neutral-800 !text-sm lg:!text-lg">Equity Direct Service</h6>
                     <p className="text-xs lg:text-sm !text-legacisBlue">Invest Directly. Grow Confidently.</p>
                  </div>
               </ZoomIn>
               <ZoomIn delay={0.6} className="flex items-center gap-4 p-4 lg:p-6 rounded-sm bg-white/10 dark:bg-white/90 shadow-2xl max-w-72 w-full justify-self-start">
                  <Image
                     src="/equity-smallcase-icon.svg"
                     alt="hero"
                     width={40}
                     height={40}
                  />
                  <div>
                     <h6 className="text-neutral-800 !text-sm lg:!text-lg">Equity Smallcase</h6>
                     <p className="text-xs lg:text-sm !text-legacisBlue">Smarter Funds. Smarter Future.</p>
                  </div>
               </ZoomIn>
               <ZoomIn delay={0.9} className="flex items-center gap-4 p-4 lg:p-6 rounded-sm bg-white/10 dark:bg-white/90 shadow-2xl max-w-72 w-full justify-self-end">
                  <Image
                     src="/mutual-fund-icon.svg"
                     alt="hero"
                     width={40}
                     height={40}
                  />
                  <div>
                     <h6 className="text-neutral-800 !text-sm lg:!text-lg">Portfolio Review</h6>
                     <p className="text-xs lg:text-sm !text-legacisBlue">Smarter stock picks</p>
                  </div>
               </ZoomIn>
            </div>

          </div>

         </div>


      </main>
   )
}