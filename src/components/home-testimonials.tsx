'use client'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react';

const DESKTOP_CARD_WIDTH = 450;
const MOBILE_CARD_WIDTH = 360; // Make sure this fits your mobile container
const CARD_GAP = 40;

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Doe",
      designation: "Financial Analyst",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
    {
      id: 2,
      name: "Diana Evans",
      designation: "Risk Analyst",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
    {
      id: 3,
      name: "Michael Smith",
      designation: "Investment Banker",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
    {
      id: 4,
      name: "Sarah Johnson",
      designation: "Financial Advisor",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
    {
      id: 5,
      name: "David Brown",
      designation: "Wealth Manager",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
    {
      id: 6,
      name: "Emily Davis",
      designation: "Portfolio Manager",
      content: "Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless user experience that makes every transaction easy and stress-free. Say goodbye to confusion and hello to straightforward payments.",
      rating : 5,
    },
  ];

  // Duplicate testimonials for infinite scroll
  const extendedTestimonials = [...testimonials, ...testimonials];

  // Always use desktop width for SSR, update after mount
  const [cardWidth, setCardWidth] = useState(DESKTOP_CARD_WIDTH);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(window.innerWidth < 640 ? MOBILE_CARD_WIDTH : DESKTOP_CARD_WIDTH);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length ? 0 : prev + 1));
  };

  return (
    <div className="sm:p-4 mb-4 flex flex-col lg:flex-row items-center gap-8 justify-center py-8 sm:py-0 2xl:p-12 w-full">
      <div className="flex flex-col items-start justify-center gap-6 flex-1 max-w-2xl lg:w-full">
        <h6 className="rounded-lg shadow shadow-neutral-200 dark:shadow-neutral-600 px-2 py-1 text-legacisPurple dark:text-legacisGreen font-medium xl:text-2xl">Testimonials</h6>
        <h2 className="text-3xl lg:text-4xl 2xl:text-5xl font-medium leading-10 sm:leading-14 text-neutral-800 dark:text-neutral-200">
          We’ve build trust with <br /> reviews from real users
        </h2>
        <p className="text-sm lg:text-lg">
          Boost your credibility by featuring genuine testimonials from real users, showcasing their positive experiences and satisfaction with Monks Pay services.
        </p>
        <div className='flex items-center gap-8'>
          <Button
            variant={'outline'}
            className='rounded-full flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white p-2 shrink-0 h-10 w-10'
            onClick={handlePrev}
          >
            <ChevronLeft size={32} className='h-8 w-8' />
          </Button>
          <Button
            variant={'outline'}
            className='rounded-full flex items-center border-0 justify-center hover:bg-neutral-800 hover:text-white p-2 shrink-0 h-10 w-10'
            onClick={handleNext}
          >
            <ChevronRight size={32} className='h-8 w-8' />
          </Button>
        </div>
      </div>
      <div className="flex-1 max-w-2xl w-full overflow-hidden py-4">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${index * (cardWidth + CARD_GAP)}px)`,
            gap: `${CARD_GAP}px`,
            width: `${extendedTestimonials.length * (cardWidth + CARD_GAP)}px`,
          }}
        >
          {extendedTestimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-800 p-6 sm:p-10 rounded-2xl shadow-sm flex flex-col"
              style={{
                minWidth: `${cardWidth}px`,
                maxWidth: `${cardWidth}px`,
                flex: '0 0 auto',
                opacity: i === index ? 1 : 0.5,
              }}
            >
              {/* Rating stars on top */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={18}
                    className={idx < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                    fill={idx < testimonial.rating ? "#facc15" : "none"}
                  />
                ))}
              </div>
              {/* Person below stars */}
              <p className="text-neutral-700 dark:text-neutral-300">{testimonial.content}</p>
              <div className="flex items-center gap-4 my-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                  {/* {testimonial.image ? (
                    <img src={testimonial?.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : ( */}
                    <User size={32} className="text-neutral-400" />
                  {/* // )} */}
                </div>
                <div className="mt-2">
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">{testimonial.name}</h3>
                  <p className="text-base text-neutral-600 dark:text-neutral-400">{testimonial.designation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;