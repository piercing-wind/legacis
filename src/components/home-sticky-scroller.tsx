'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ZoomIn } from './animation/zoom';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import { GradientLineVertical } from './icon';
import { ArrowUpRight, ArrowUpRightIcon, DollarSign, LogIn, TrendingUp, ChevronLeft, ChevronRight, Frown, Smile, IndianRupee } from "lucide-react";
import { homeWhyChooseUs, homeService } from '@/lib/data/static-data';
import { chunkArray, cn } from '@/lib/utils';


function HomeStickyScroller() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const howItWorks = [
    {
      icon: LogIn,
      title: 'Create an Account',
      description: 'Sign up and complete your KYC in minutes.',
      link: '/authenticate',
      step: '01',
    },
    {
      icon: TrendingUp,
      title: 'Choose Your Strategy',
      description: 'Select from our range of investment strategies.',
      step: '02',
      link: '/services',
    },
    {
      icon: IndianRupee,
      title: 'Start Investing',
      description: 'Invest with confidence and track your portfolio.',
      step: '03',
      link: '/dashboard',
    },
    {
      icon: ArrowUpRightIcon,
      title: 'Grow Your Wealth',
      description: 'Monitor your investments and watch your wealth grow.',
      link: '/dashboard',
      step: '04',
    },
  ]

  const howItWorksChunks = chunkArray(howItWorks, 2);

  const sections = [
    {
      id: 'ready-to-invest',
      content: (
        <div className="min-w-[340px] sm:min-w-4xl lg:min-w-full flex-shrink-0 bg-gray-600 p-4 rounded-2xl min-h-[70vh] grid grid-cols-1 lg:grid-cols-2 place-items-center gap-8 py-8 sm:py-12 sm:p-8 2xl:px-20 2xl:p-12 shadow-lg w-full">
          <div className="flex flex-col items-start justify-center gap-4 sm:gap-6 flex-1  lg:w-full">
            <span className="rounded-lg shadow shadow-neutral-700 px-2 py-1 text-legacisGreen font-medium xl:text-2xl">Ready to Invest?</span>
            <h2 className="text-2xl lg:text-4xl 2xl:text-5xl font-medium leading-8 sm:leading-14 text-neutral-50">
              Just a Few Clicks to Grow Your Wealth
            </h2>
            <p className="text-sm lg:text-lg !text-neutral-200">
              Getting started with Legacis is simple and seamless. Whether you&apos;re a beginner or a seasoned investor, our guided process helps you invest with confidence — in just a few quick steps.
            </p>
            <Button asChild variant={'secondary'} className="max-w-80 dark:bg-white/80 dark:hover:bg-white font-normal text-base h-12 rounded-sm">
              <Link href={'/services'} className="gap-4 !font-medium !text-neutral-800 hover:!text-neutral-800">
                Get Started Now
                <ArrowUpRightIcon className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col w-full gap-8 sm:p-4 rounded-2xl  justify-center">
            {howItWorksChunks.map((group, rowIdx) => (
              <div key={rowIdx} className="flex gap-0 justify-center">
                {group.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={index}>
                      <Link href={item.link || '#'} className="w-full !text-legacisGreen">
                        <ZoomIn className="w-full p-2 sm:p-4 flex-1 flex flex-col">
                          <div className="relative max-w-24 mb-4 sm:mb-8">
                            <span className="text-3xl sm:text-5xl font-bold font-urbanist">{item.step}</span>
                            <Icon className="absolute h-8 w-8 -bottom-2 left-[80%] -translate-x-1/2" />
                          </div>
                          <span className="text-sm sm:text-lg font-semibold text-neutral-50 ">{item.title}</span>
                          <p className="text-xs sm:text-sm mt-2 !text-neutral-200">{item.description}</p>
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
      )
    },
    {
      id: 'mock-phone',
      content: (
        <div 
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
            className="relative min-w-[340px] sm:min-w-4xl lg:min-w-full flex-shrink-0 bg-gray-600 px-4 p-4 rounded-2xl min-h-[70vh] gap-8 py-8 sm:py-12 sm:p-8 2xl:px-20 2xl:p-12 shadow-lg grid grid-cols-1 lg:grid-cols-2 place-items-center w-full"
         >
            <div className="flex-1 flex flex-col gap-8 w-full">
               <span className="self-start rounded-lg shadow shadow-neutral-700 px-2 py-1 text-legacisGreen font-medium xl:text-2xl">Portfolio in Your Pocket</span>
               <h2 className="text-2xl lg:text-4xl 2xl:text-5xl font-medium leading-8 sm:leading-14 text-neutral-50">
                  Experience Legacis on Your Phone
               </h2>
               <p className="text-sm lg:text-lg max-w-2xl !text-neutral-200">       
                  Experience the Legacis platform on your phone with our intuitive mockup design. Explore how easy it is to manage your investments, track your portfolio, and make informed decisions on the go.
               </p>
            </div>
            <div className="flex-1 relative w-full max-w-2xl mt-8 min-h-[50vh] sm:min-h-[60vh]">
               <Image

                  src="/phone-design.png"
                  alt="mock-phone"
                  fill
                  className="object-contain rounded-2xl"
               />
            </div>         
        </div>
      )
    },
    {
      id: 'why-choose-us',
      content: (
        <div 
         style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
         className="relative min-w-[340px] sm:min-w-4xl lg:min-w-full flex-shrink-0 p-4 bg-gray-600 rounded-2xl min-h-[70vh] flex flex-col items-center gap-8 justify-center py-8 sm:py-12 sm:p-8 2xl:px-20 2xl:p-12 shadow-lg">
         <span className="self-start rounded-lg shadow shadow-neutral-700 px-2 py-1 text-legacisGreen font-medium xl:text-2xl">From Problem to Solution</span>

         <h2 className="self-start text-2xl lg:text-4xl 2xl:text-5xl font-medium leading-8 sm:leading-14 text-neutral-50">
             The Legacis Advantage
         </h2>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 z-5 pb-8">
            {homeWhyChooseUs.map((item, index) => (
              <div key={index} className={cn(item.color, "w-full shadow-lg sm:min-h-64 lg:min-h-80 rounded-2xl p-4 sm:p-8 flex flex-col items-start justify-center relative overflow-clip")}>
                <span className='flex items-center gap-1 font-medium text-sm dark:text-neutral-800'>Problem :</span>
                <span className="t dark:text-neutral-800 sm:text-xl font-medium w-full mt-2 text-neutral-700">{item.title}</span>
                <div className="border-t w-1/2  my-2 sm:my-4 border-neutral-300"/>
                <span className='flex items-center gap-1 font-medium text-sm dark:text-neutral-800'>Solution :</span>
                <p className="text-xs sm:text-base !text-neutral-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'simple-steps',
      content: (
        <div 
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
          className="min-w-[340px] sm:min-w-4xl lg:min-w-full flex-shrink-0 bg-gray-600 p-4 rounded-2xl min-h-[70vh] grid grid-cols-1 lg:grid-cols-2  items-center justify-center gap-8 py-8 sm:py-12 sm:p-8 2xl:px-20 2xl:p-12 shadow-lg">
          <div className="flex flex-col items-start justify-center gap-2 lg:gap-6 flex-1 lg:w-full py-4">
            <span className="self-start rounded-lg shadow shadow-neutral-700 px-2 py-1 text-legacisGreen font-medium xl:text-2xl">Get Started</span>
            <h2 className="text-2xl lg:text-4xl 2xl:text-5xl font-medium leading-8 sm:leading-14 text-neutral-50">
              Simple Steps to Smarter Investing
            </h2>
            <p className="text-sm lg:text-lg !text-neutral-200">
              Accelerate your wealth creation with our data driven, expertly curated investments.
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-8 max-w-md w-full pb-8 mx-auto">
            {homeService.map((item, index) => (
              <div key={index} className={cn("flex w-full", index % 2 === 0 ? "justify-start" : "justify-end")}>
                <Button
                  asChild
                  variant="outline"
                  aria-label={item.name}
                  title={item.name}
                  className={cn(
                    "w-full max-w-80 p-4 py-6 border-0 text-base text-neutral-800 dark:text-neutral-800 h-auto flex items-center justify-between gap-4 rounded-lg",
                    item.tw
                  )}
                >
                  <Link href={item.link} className="flex items-center w-full">
                    <Image src={item.icon} alt="hero" width={40} height={40} />
                    <span>{item.name}</span>
                    <ArrowUpRightIcon className="inline-block w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const scrollToSection = useCallback((index: number) => {
    if (scrollRef.current) {
      const sectionWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * sectionWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  }, []);

  const nextSection = React.useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % sections.length;
      scrollToSection(nextIndex);
      return nextIndex;
    });
  }, [sections.length, scrollToSection]);

  const prevSection = React.useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const prevIdx = prevIndex === 0 ? sections.length - 1 : prevIndex - 1;
      scrollToSection(prevIdx);
      return prevIdx;
    });
  }, [sections.length, scrollToSection]);

  // Auto scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      nextSection();
    }, 3000); // Auto scroll every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isAutoScrolling, nextSection]);

  // Pause auto scroll on hover
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  return (
    <div className="w-full relative">
      {/* Desktop version - original layout */}
      <div className="hidden lg:block w-full relative flex-1 space-y-8 p-2 mb-4 lg:mb-0 max-h-[72vh] overflow-y-auto mx-auto">
        {sections.map((section, index) => (
          <div key={section.id} className="sm:sticky top-0" style={{ zIndex: 5 + index }}>
            {section.content}
          </div>
        ))}
      </div>

      {/* Mobile version - horizontal scroll */}
      <div className="lg:hidden relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 p-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {sections.map((section) => (
            <div key={section.id} className="snap-center">
              {section.content}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <Button
          onClick={prevSection}
          variant={'outline'}
          aria-label='Go left'
          title='Go left'
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white shrink-0 h-10 w-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={nextSection}
         variant={'outline'}
          aria-label='Go right'
          title='Go right'
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg z-10 flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white shrink-0 h-10 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {sections.map((_, index) => (
            <Button
              key={index}
              onClick={() => scrollToSection(index)}
              aria-label={`Go to section ${index + 1}`}
              title={`Go to section ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentIndex === index ? "bg-legacisPurple w-8" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeStickyScroller