import React from "react"
import { GradientLine, Line } from "@/components/icon"
import Chart from "@/components/services/chart"
import { isServicePurchased, getServiceDataById, findServiceByCategory, findServicesByIds, ServiceWithComplimentary } from "@/lib/data/services"
import { ChartDataPoint, FaqItem, Philosophy, ServiceFeature } from "@/types/service"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import Plans from "@/components/services/plans"
import Faq from "@/components/services/faq"
import PurchasedServiceSection from "@/components/services/purchasedServiceSection"
import { Session } from "@/actions/session"
import { User } from "next-auth"
import { formatHumanDate } from "@/lib/utils"
import { findAgreementsByServiceId } from "@/lib/data/agreement"
import { CheckoutForm } from "@/components/services/checkoutForm"
import { redirect } from "next/navigation"
import { ZoomIn } from "@/components/animation/zoom"
import Image from "next/image"
import { Service, ServicePlan } from "@/prisma/generated/client"
import { QuillHtmlViewer } from "@/components/richTextViewer"
import { ServiceCard as ServiceCardOg } from "@/components/services/serviceCard"
import { getServiceDisplayPrice } from "@/lib/utils/servicePricingDisplay"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: "Mutual Funds",
    description: "Explore our range of mutual fund services tailored to your financial goals.",
};

// Extract chart data processing to a utility function
function processChartData(services: Service[]): ChartDataPoint[] {
  const chartData: ChartDataPoint[] = Array.isArray(services)
    ? services.flatMap(s => Array.isArray(s.chart) ? (s.chart as ChartDataPoint[]) : [])
    : [];

  // Sort by date
  chartData.sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('-').map(Number);
    const [dayB, monthB, yearB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  return chartData;
}

// Extract combined data processing FAQ included
async function extractCombinedData(services: Service[]) {
   const allPhilosophies: Philosophy[] = Array.isArray(services)
     ? services.flatMap(s => Array.isArray(s.philosophy) ? (s.philosophy as Philosophy[]) : [])
     : [];

   // Robustly extract all FAQ items, handling both direct array and nested .faq.faq
   const allFaq: FaqItem[] = Array.isArray(services)
     ? services.flatMap(s => {
         if (Array.isArray(s.faq)) {
          return s.faq as FaqItem[];
         }
         if (s.faq && Array.isArray((s.faq as any).faq)) {
           return (s.faq as any).faq as FaqItem[];
         }
         return [];
      })
     : [];

   // Extract all recommended service IDs from all services, deduplicated
   const recommendedServicesIds: string[] = Array.isArray(services)
   ? Array.from(new Set(
         services.flatMap(s =>
         Array.isArray(s.recommendedService) ? s.recommendedService : []
         )
      ))
   : [];

   const deltas = Array.isArray(services)
   ? services.flatMap(s => {
         if (
         s.detailMutualFundPageDelta &&
         typeof s.detailMutualFundPageDelta === "object" &&
         Array.isArray((s.detailMutualFundPageDelta as any).ops)
         ) {
         return [s.detailMutualFundPageDelta];
         }
         return [];
      })
   : [];

   const delta = {
   ops: deltas.flatMap((d, i) => [
      ...((Array.isArray((d as any).ops) ? (d as any).ops : [])),
      ...(i < deltas.length - 1 ? [{ insert: "\n" }] : []),
   ]),
   };


  return { allPhilosophies, allFaq, recommendedServicesIds, delta};
}
// Extract service card processing to a component
function ServiceCard({ 
  service, 
  idx, 
  purchasedService, 
  highlights, 
  plans, 
  agreement 
}: {
  service: any;
  idx: number;
  purchasedService: any;
  highlights: { name: string; value: string; }[];
  plans: ServicePlan[];
  agreement: any;
}) {
  return (
    <div key={service.id + idx} className="xl:max-w-xl w-full flex-1 rounded-2xl p-6 flex flex-col gap-2 border">
      <h1 className="!text-xl font-medium">{service?.name}</h1>
      <p className="text-xs">{service?.tag}</p>
      <p className="text-xs my-2">{service?.description}</p>
      <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20" />
      
      {/* Highlights grid */}
      {highlights && Array.from({ length: Math.ceil(highlights.length / 3) }).map((_, rowIdx) => {
        const rowItems = highlights.slice(rowIdx * 3, rowIdx * 3 + 3);
        return (
          <div key={rowIdx} className="w-full flex flex-row items-center justify-center text-nowrap gap-2 my-2 h-20">
            {rowItems.map((item, idx) => (
              <React.Fragment key={item.name + idx}>
                <span className="relative flex flex-col gap-2 w-full h-full items-center justify-center">
                  <p className="text-xs text-wrap text-center">{item.name}</p>
                  <p className="font-medium">{item.value}</p>
                </span>
                {idx < rowItems.length - 1 && (
                  <Line color="var(--text-color)" vertical height="100%" width="2px" className="self-stretch h-full opacity-20" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      })}
      
      <Line color="var(--text-color)" height="2px" className="self-stretch opacity-20" />
      
      {/* Subscription button */}
      {purchasedService ? (
        <Button variant={'outline'} className="w-full border-2 mt-auto p-2 h-10 lg:h-14 uppercase rounded-full">
          <span className="text-green-500">Subscribed</span> |
          <span className="text-xs">Expiring On: {formatHumanDate(purchasedService.expiryDate)}</span>
        </Button>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full mt-auto p-2 h-10 lg:h-14 uppercase rounded-full">Subscribe Now</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-7xl p-4 pb-24 overflow-x-hidden overflow-y-auto flex flex-col lg:flex-row items-stretch justify-between gap-4">
              <div className="rounded-2xl border flex-1 min-w-0 flex flex-col mb-4 lg:mb-0">
                <DrawerHeader>
                  <DrawerTitle className="!text-2xl lg:!text-3xl">Subscription Plans</DrawerTitle>
                </DrawerHeader>
                <Plans 
                  service={service}
                  plans={plans}
               />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <CheckoutForm service={service} agreement={agreement} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

// Philosophy section component
function PhilosophySection({ philosophies }: { philosophies: Philosophy[] }) {
  const philosophyColor = ["#F0F7FF", "#F1FFFA", "#E2FFE9", "#F6F0FF", "#E6F7FF", "#F0F7FF"];
  
  return (
    <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative rounded-2xl lg:mb-0 ">
      <h2 className="text-xl font-medium mb-4">Our Philosophy</h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {philosophies.map((item, index) => (
          <ZoomIn
            key={index}
            delay={index * 0.1}
            className="w-full p-8 overflow-clip rounded-xl text-neutral-800 min-h-64 flex gap-6 flex-col items-start justify-center shadow hover:shadow-lg transition-all duration-500 relative"
            style={{ background: `var(--philosophy-bg-${index % 6})` }}
          >
            <Image
              src={`/icons/philosophy/${(index % philosophyColor.length) + 1}.png`}
              alt={`Philosophy ${index + 1}`}
              width={100}
              height={100}
              className="absolute top-0 right-0 w-14 h-14 opacity-60"
            />
            <h3 className="font-medium text-lg">{item.title}</h3>
            <p className="text-sm !text-neutral-600">{item.description}</p>
          </ZoomIn>
        ))}
      </div>
    </div>
  );
}

export default async function Page() {
  const session = await Session();
  const user: User = session?.user;
  if (!user) redirect('/authenticate?callbackurl=/mutual-funds');

  const services = await findServiceByCategory('RESEARCH_ADVISORY_MUTUAL_FUNDS');
  if (!services || services.length === 0) {
    return <div>No services found</div>;
  }

  // Process all data in parallel for better performance
  const [
    chartData,
    { allPhilosophies, allFaq, recommendedServicesIds, delta },
    ...servicePromises
  ] = await Promise.all([
    Promise.resolve(processChartData(services)),
    Promise.resolve(extractCombinedData(services)),
    ...services.map(async (service) => {
      const [purchasedService, agreement] = await Promise.all([
        user?.id && service?.id ? isServicePurchased(user.id, service.id) : null,
        findAgreementsByServiceId(service?.id || '')
      ]);

      const features: ServiceFeature | undefined = service?.features ? (service?.features as ServiceFeature) : undefined;
      const { displayPrice } = getServiceDisplayPrice(service.plans);
      const highlights = [
        ...(features?.highlights ?? []),
        { name: "Subscription Starting", value: `₹${displayPrice}/mo` }
      ];

      return {
        service,
        purchasedService,
        highlights,
        plans: service.plans,
        agreement
      };
    })
  ]);

  const latestData = chartData[chartData.length - 1];

  // Process purchased services data
  const purchasedServicesData = await Promise.all(
    servicePromises
      .filter(({ purchasedService }) => purchasedService)
      .map(async ({ service, purchasedService }) => {
        const data = service?.id && service?.type 
          ? await getServiceDataById(service.id, service.type) 
          : null;
        return { service, purchasedService, data };
      })
  );

   let recommendedServices: ServiceWithComplimentary[] = []

   if (recommendedServicesIds.length > 0) {
      recommendedServices = await findServicesByIds(recommendedServicesIds);
   }
  
  return (
    <main className='w-full px-5 lg:px-10 xl:px-24 py-8'>

      { purchasedServicesData.length > 0 && (
        <PurchasedServiceSection serviceType={'RESEARCH_ADVISORY_MUTUAL_FUNDS'} mfServiceData={purchasedServicesData} />
      )}
      {/* Service Cards */}
      <div className="my-12 ">
         <h2 className="text-xl font-medium p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:bg-gradient-to-r dark:from-transparent dark:to-transparent dark:border dark:shadow-lg rounded-xl">Mutual Funds</h2>
      </div>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {servicePromises.map((serviceData, idx) => (
          <ServiceCard
            key={serviceData.service.id || idx}
            service={serviceData.service}
            idx={idx}
            purchasedService={serviceData.purchasedService}
            highlights={serviceData.highlights}
            plans={serviceData.plans}
            agreement={serviceData.agreement}
          />
        ))}
      </section>

      {/* Chart or Philosophy Section */}
      <section className="flex flex-col-reverse xl:flex-row items-stretch justify-center gap-8 w-full my-8 mb-12">
        {chartData.length === 0 ? (
          <PhilosophySection philosophies={allPhilosophies} />
        ) : (
          <div className="w-full lg:min-w-3xl xl:min-w-4xl flex-1 relative border rounded-2xl p-2 mb-4 lg:mb-0">
            <div className="w-full flex flex-col md:flex-row md:items-center gap-1 md:gap-8 justify-center">
              <p className="text-sm">Main: <span className="text-green-500">{latestData?.main ?? ""}</span></p>
              <p className="text-sm">Comparison: <span className="text-green-500">{latestData?.comparison ?? ""}</span></p>
            </div>
            <Chart chartData={chartData} mainLabel="Main" comparisonLabel="Comparison" />
          </div>
        )}
      </section>


      {/* Additional Information */}

      <section className="prose prose-lg dark:prose-invert max-w-none text-sm !text-neutral-600 p-4 px-6 border rounded-2xl my-14 dark:bg-neutral-800">
         <QuillHtmlViewer delta={delta} />
      </section>


      {/* FAQ and Recommended Services */}
      <Faq className="mt-8" title="Mutual Funds FAQ" faq={allFaq} />
        
      { recommendedServices && recommendedServices.length > 0 && (
         <section className="w-full p-4 border rounded-2xl mt-8 dark:bg-neutral-800">
            <h6 className="!text-xl mb-4">Recommended Services</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             
               {recommendedServices.map((service, idx) => (
                  <ServiceCardOg 
                     key={idx} 
                     service={service} 
                  />
               ))}
            </div>
         </section>
      )}


    </main>
  );
}