import React from 'react';
import Legacis from '@/components/about-page/legacis';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ZoomIn } from '@/components/animation/zoom';
import { GradientLineVertical } from '@/components/icon';
import { EyeIcon, TrendingUp, DollarSign, ArrowUpRightIcon } from 'lucide-react';
import { chunkArray, cn } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about Legacis Capital, our philosophy, and our team of SEBI-registered experts.",
};

const Page = () => {
   
  const howItWorks = [
    {
      icon: EyeIcon,
      title: 'Future Focused Approach',
      description: 'We are mindful of the past but prioritize future opportunities and trends to guide our investment decisions.',
      link: '#',
      step: '01',
    },
    {
      icon: TrendingUp,
      title: 'Data-Driven Decisions',
      description: 'Every tool and insight we provide is backed by real data, ensuring users make confident, informed investment decisions.',
      step: '02',
      link: '#',
    },
    {
      icon: DollarSign,
      title: 'Clarity Over Complexity',
      description: 'We simplify financial concepts into clear, actionable insights—because understanding your money shouldn’t require a finance degree.',
      step: '03',
      link: '#',
    },
    {
      icon: ArrowUpRightIcon,
      title: ' Empower Through Education',
      description: 'We believe in empowering individuals with knowledge, not just services—building confidence and independence in every financial journey.',
      link: '#',
      step: '04',
    },
  ]
  const howItWorksChunks = chunkArray(howItWorks, 2);
   const ourTeam = [
      {
         name : 'Raghav Wadhwa',
         role: 'Founder & CEO',
         image: '/raghav-wadhwa.png',
         social : {
            x: 'https://x.com/raghavwadhwa',
            linkedin: 'https://www.linkedin.com/in/raghavwadhwa/'
         }
      },
      {
         name : 'Raghav Wadhwa',
         role: 'Founder & CEO',
         image: '/raghav-wadhwa.png',
         social : {
            x: 'https://x.com/raghavwadhwa',
            linkedin: 'https://www.linkedin.com/in/raghavwadhwa/'
         }
      },
      {
         name : 'Raghav Wadhwa',
         role: 'Founder & CEO',
         image: '/raghav-wadhwa.png',
         social : {
            x: 'https://x.com/raghavwadhwa',
            linkedin: 'https://www.linkedin.com/in/raghavwadhwa/'
         }
      },
      {
         name : 'Raghav Wadhwa',
         role: 'Founder & CEO',
         image: '/raghav-wadhwa.png',
         social : {
            x: 'https://x.com/raghavwadhwa',
            linkedin: 'https://www.linkedin.com/in/raghavwadhwa/'
         }
      },
      {
         name : 'Raghav Wadhwa',
         role: 'Founder & CEO',
         image: '/raghav-wadhwa.png',
         social : {
            x: 'https://x.com/raghavwadhwa',
            linkedin: 'https://www.linkedin.com/in/raghavwadhwa/'
         }
      },
   ]

  return (
    <main className="w-full h-full px-5 lg:px-10 xl:px-24 py-14">
      <section className='w-full grid grid-cols-1 lg:grid-cols-2 place-items-start gap-12 min-h-[50vh] mb-24'>
         <div className="w-full flex flex-col shadow-2xl shadow-neutral-100 dark:shadow-neutral-800 p-4 sm:p-8 h-full rounded-2xl relative">
            <h1 className="text-3xl sm:text-4xl mb-6">About Us</h1>
            <p className=" text-gray-700 mb-6 leading-relaxed">
               Legacis Capital is the brand under which Samar Wealth Advisors operates - a SEBI-registered Investment Adviser (INA000019345) and SEBI-registered Research Analyst (INH000018036).
            </p>
            <p className=" text-gray-700 mb-6 leading-relaxed">
               Created to bring institutional-grade research to Indian portfolios, Legacis blends rigorous fundamentals with price-trend validation (techno-funda) to build high-conviction baskets. We focus on under-followed businesses with improving earnings momentum, clean balance sheets, and room to scale—hidden gems that larger markets often miss.
            </p>
            <p className=" text-gray-700 mb-6 leading-relaxed">
               Every idea is documented. Risks are sized before returns. Entries and exits follow evidence, not emotion. Reviews are timely and transparent, so compounding becomes a process, not a promise.
            </p>

            <Button variant={'outline'} asChild className="mt-4 max-w-52 h-auto py-4 bg-legacisGreen/80 dark:bg-legacisGreen/80 hover:bg-legacisGreen/70 dark:hover:bg-legacisGreen/70 rounded-full border-0 shadow-2xl">
               <Link href={'#our-team'} className='hover !text-neutral-800 dark:hover:!text-neutral-700'>
               Meet Your Team
               </Link>
            </Button>
         </div>
         <div className="w-full hidden lg:block relative h-full rounded-2xl p-4 shadow-2xl shadow-neutral-100 dark:shadow-neutral-800">
            <h2 className='text-3xl sm:text-4xl mb-4'>Our <span className='text-legacisGreen'>Investment</span> Philosophy</h2>
            <div className="flex flex-col w-full">
            {howItWorksChunks.map((group, rowIdx) => (
              <div key={rowIdx} className="flex gap-0 justify-center">
                {group.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={index}>
                      <Link href={item.link || '#'} className="w-full hover:!text-legacisGreen">
                        <ZoomIn className="w-full p-2 sm:p-4 flex-1 flex flex-col">
                          <Icon className={cn("h-16 w-16 rounded-full shadow shadow-neutral-100 dark:shadow-neutral-800 p-4 shrink-0 mb-4 ",
                           index % 2 === 0 ? 
                           'bg-gradient-to-tr from-transparent to-indigo-100 dark:to-indigo-100/50 text-indigo-600 dark:text-indigo-200' : 
                           'bg-gradient-to-tr from-transparent to-green-100 dark:to-green-100/50 text-legacisGreen',
                          )} />
                          <h6 className="text-sm sm:text-lg font-medium">{item.title}</h6>
                          <p className="text-xs sm:text-sm mt-2 !text-neutral-600 dark:!text-neutral-400">{item.description}</p>
                        </ZoomIn>
                      </Link>
                      {index === 0 && group.length > 1 && (
                        <GradientLineVertical
                          height="100%"
                          width="1px"
                          color="var(--text-color)"
                          className="mx-2 hidden md:block self-center"
                          style={{ minHeight: 120 }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
         </div>
      </section>

      <section className="mb-10 ">

           <Legacis />
      </section>

      <section id='our-team' className='w-full mt-20' >
         <h2 className='text-3xl sm:text-4xl mb-6'>Meet Your <span className='text-legacisGreen'>Team</span></h2>

         <p className=' mb-20 leading-relaxed max-w-xl pl-4 border-l-4 border-legacisGreen'>
            We are dedicated to providing you with the best financial tools and insights. We are committed to transparency, precision, and personalized growth strategies to help you secure a prosperous future.
         </p>
         {/* Team component can be added here */}
         <h2 className='text-xl sm:text-2xl mb-6 font-semibold mt-20'>Founders</h2>
         <div className='mt-8 flex items-stretch gap-8'>
            <div className='max-w-sm w-full flex-1 shrink-0 p-4 rounded-lg shadow-2xl shadow-neutral-200 dark:shadow-neutral-800'>
              <div className='flex flex-col items-center'>
                  <Image
                     src="/raghav-wadhwa.png"
                     alt="Team Image"
                     width={600}
                     height={400}
                     className="w-full h-auto rounded-lg mb-4 outlined"
                  />
              </div>
              <div className='py-4'>
                  <div className='flex items-end justify-between'>
                     <p className='text-sm text-neutral-600 dark:text-neutral-400 font-medium tracking-wide'>Founder & CEO</p>
                     <div className='flex gap-5'>
                        <Link href="https://x.com/raghavwadhwa" target="_blank">
                           <svg xmlns="http://www.w3.org/2000/svg" 
                              width="20" 
                              height="20" 
                              className='hover:scale-110 transition-all duration-200 '
                              viewBox="0 0 1200 1227" 
                              fill="none">
                              <g clipPath="url(#clip0_1_2)">
                              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
                              fill="currentColor"/></g><defs><clipPath id="clip0_1_2"><rect width="1200" height="1227" fill="white"/></clipPath></defs></svg>
                        </Link>
                        <Link href="https://www.linkedin.com/in/raghav-wadhwa-72378ab1/" target="_blank">
                           <svg 
                             height="22" 
                             width="22"
                             className='hover:scale-110 transition-all duration-200'
                             fill='currentColor'
                             style={{fillRule:"evenodd", clipRule:"evenodd", strokeLinejoin:"round", strokeMiterlimit:"2"}} 
                             version="1.1" viewBox="0 0 512 512" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M473.305,-1.353c20.88,0 37.885,16.533 37.885,36.926l0,438.251c0,20.393 -17.005,36.954 -37.885,36.954l-436.459,0c-20.839,0 -37.773,-16.561 -37.773,-36.954l0,-438.251c0,-20.393 16.934,-36.926 37.773,-36.926l436.459,0Zm-37.829,436.389l0,-134.034c0,-65.822 -14.212,-116.427 -91.12,-116.427c-36.955,0 -61.739,20.263 -71.867,39.476l-1.04,0l0,-33.411l-72.811,0l0,244.396l75.866,0l0,-120.878c0,-31.883 6.031,-62.773 45.554,-62.773c38.981,0 39.468,36.461 39.468,64.802l0,118.849l75.95,0Zm-284.489,-244.396l-76.034,0l0,244.396l76.034,0l0,-244.396Zm-37.997,-121.489c-24.395,0 -44.066,19.735 -44.066,44.047c0,24.318 19.671,44.052 44.066,44.052c24.299,0 44.026,-19.734 44.026,-44.052c0,-24.312 -19.727,-44.047 -44.026,-44.047Z" 
                             style={{fillRule:"nonzero"}}/></svg>
                        </Link>
                     </div>
                  </div>
                  
                  <h3 className='text-2xl font-semibold mt-2'>CA Raghav Wadhwa</h3>
              </div>
 
            </div>
            <div className='w-full flex flex-col gap-6 flex-1 p-6 shadow-2xl shadow-neutral-200 dark:shadow-neutral-800 rounded-lg items-stretch'>
               <h5 className='text-2xl font-medium'>CA Raghav Wadhwa</h5>
               <p className='pl-4 border-l-4 border-legacisGreen'>
                  A Chartered Accountant and graduate of Delhi University, holding 10+ years of professional experience leverages his expertise in auditing and forensic accounting with a sharp focus on uncovering clean businesses, grounded in solid fundamentals. His passion for equity research, rooted years back inspired him to start advising on wealth management and leading investments for his family and friends, which eventually gave rise to Legacis Capital (Earlier Samar Wealth) 
               </p>
               <p className='pl-5 '>
                  Raghav believes in data-backed investing, where every decision is rooted in deep financial analysis and market intelligence. With a focus on clean, well-managed businesses and a proven strategy of Growth, Value, and Momentum, Raghav has consistently delivered impressive returns for his clients
               </p>
            </div>
         </div>
         {/* Rest of the members */}
         <h2 className='text-xl sm:text-2xl mb-6 font-semibold mt-20'>Your Team</h2>
         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
            {ourTeam.map((member, index) => (
               <div key={index} className='max-w-sm w-full p-4 rounded-lg flex flex-col items-center'>
                  <div className='relative w-72 rounded-full overflow-clip bg-legacisPink/5 dark:bg-purple-100/50 h-72'>
                     <Image
                        src={member.image}
                        alt={`${member.name} Image`}
                        fill
                        className="w-full h-auto rounded-lg mb-4 outlined hover:scale-105 transition-all duration-500"
                     />
                  </div>
                  <div className='p-4 shadow-xl shadow-neutral-100 dark:shadow-neutral-800 rounded-lg mt-4 w-full'>
                     <div className='flex items-end justify-between'>
                        <p className='text-sm text-neutral-600 dark:text-neutral-400 font-medium tracking-wide'>{member.role}</p>
                        <div className='flex gap-5'>
                           <Link href={member.social.x} target="_blank">
                              <svg xmlns="http://www.w3.org/2000/svg" 
                                 width="20" 
                                 height="20" 
                                 className='hover:scale-110 transition-all duration-200 '
                                 viewBox="0 0 1200 1227" 
                                 fill="none">
                                 <g clipPath="url(#clip0_1_2)">
                                 <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" 
                                 fill="currentColor"/></g><defs><clipPath id="clip0_1_2"><rect width="1200" height="1227" fill="white"/></clipPath></defs></svg>
                           </Link>
                           <Link href={member.social.linkedin} target="_blank">
                              <svg 
                                height="22" 
                                width="22"
                                 className='hover:scale-110 transition-all duration-200'
                                 fill='currentColor'
                                 style={{fillRule:"evenodd", clipRule:"evenodd", strokeLinejoin:"round", strokeMiterlimit:"2"}}
                                 version="1.1" viewBox="0 0 512 512" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M473.305,-1.353c20.88,0 37.885,16.533 37.885,36.926l0,438.251c0,20.393 -17.005,36.954 -37.885,36.954l-436.459,0c-20.839,0 -37.773,-16.561 -37.773,-36.954l0,-438.251c0,-20.393 16.934,-36.926 37.773,-36.926l436.459,0Zm-37.829,436.389l0,-134.034c0,-65.822 -14.212,-116.427 -91.12,-116.427c-36.955,0 -61.739,20.263 -71.867,39.476l-1.04,0l0,-33.411l-72.811,0l0,244.396l75.866,0l0,-120.878c0,-31.883 6.031,-62.773 45.554,-62.773c38.981,0 39.468,36.461 39.468,64.802l0,118.849l75.95,0Zm-284.489,-244.396l-76.034,0l0,244.396l76.034,0l0,-244.396Zm-37.997,-121.489c-24.395,0 -44.066,19.735 -44.066,44.047c0,24.318 19.671,44.052 44.066,44.052c24.299,0 44.026,-19.734 44.026,-44.052c0,-24.312 -19.727,-44.047 -44.-026,-44.-047Z"
                                 style={{fillRule:"nonzero"}}/></svg>
                           </Link>
                        </div>
                     </div>
                     <h3 className='text-xl font-semibold mt-2'>{member.name}</h3>
                  </div>
               </div>
            ))}
         </div>
      </section>
    </main>
  );
};

export default Page;