import { Session } from "@/actions/session";
import { ChartDummy, ServiceCard } from "@/components/services/serviceCard";
import UserRiskProfileQuestions from "@/components/services/userRiskProfileForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserRiskProfileById } from "@/lib/data/admin/risk-profile";
import { findRiskRecommendations } from "@/lib/data/riskLevelServiceRecommendation";
import { findServices, getUserPurchasedServiceById } from "@/lib/data/services";
import { dashboardWhyChooseUs } from "@/lib/data/static-data";
import { cn, formatDateWithTime, formatHumanDate, getServiceLink, getUniqueSpecialServices } from "@/lib/utils";
import { ArrowRight, ArrowRightCircle, Calculator, File, Presentation } from "lucide-react";
import { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import PortfolioReviewFileUpload from "@/components/services/portfolioReviewFileUpload";
import { ClockLoader } from "react-spinners";
import { getUserPurchasedServicesPortfolio } from "@/lib/data/portfolio-review";
import { GradientLine } from "@/components/icon";
import { getColorForCardByServiceType } from "@/lib/utils/serviceCardColorGenerator";


function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function Page() {
   const session = await Session();
   const user : User = session?.user
   if(!user) redirect('/authenticate?callbackurl=/dashboard');

   const [userPurchasedServices, userPurchasedServicesPortfolio, services, riskProfile, riskRecommendation] = await Promise.all([
      getUserPurchasedServiceById(user.id),
      // Fetching portfolio review services separately because getUserPurchasedServiceById only fetches active services
      getUserPurchasedServicesPortfolio(user.id), 
      findServices(),
      getUserRiskProfileById(user.id),
      findRiskRecommendations()
   ])
   
   const userPurchasedServicesOtherThanPortfolioReview = userPurchasedServices?.filter(
      (service) => service.service?.type !== 'PORTFOLIO_REVIEW'
   );



   let filteredServices = [];

   if (riskProfile?.riskLevel && Array.isArray(riskRecommendation)) {
   // Find the recommendation for the user's risk level
   const rec = riskRecommendation.find(
      (r) => r.riskLevel === riskProfile.riskLevel
   );
   
   if (rec && Array.isArray(rec.services) && rec.services.length > 0) {
      // Filter services that are recommended
      filteredServices = services.filter((service) =>
         rec.services.includes(service.id)
      );
   } else {
      // If no recommendation for this risk level, show all services
      filteredServices = services;
   }
   } else {
      // If no risk profile or recommendations, show all services
      filteredServices = services;
   }

   const recommendedServices = getUniqueSpecialServices(filteredServices)

   const hasPortfolioReview = userPurchasedServicesPortfolio && userPurchasedServicesPortfolio.length > 0;
   const hasRegularService = userPurchasedServicesOtherThanPortfolioReview && userPurchasedServicesOtherThanPortfolioReview.length > 0;

   return (
      <div className="w-full px-5 lg:px-10 xl:px-24 py-8">
            <div>
               <h1 className="text-2xl font-medium">Welcome {toTitleCase(user.name || 'User')}!</h1>
               <p className="text-sm text-muted-foreground">Let’s get started on your financial journey.</p>
            </div>

            {!hasRegularService && !hasPortfolioReview && (
               <section className="p-4 py-8 mt-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl ">
                  <h5 className="text-2xl font-medium mb-4">Subscribed Services</h5>
                  <div className="w-full flex flex-col lg:flex-row gap-8 sm:border rounded-xl items-start justify-between mt-4 bg-background  overflow-clip">
                     <div className="md:h-80 w-full sm:p-4 flex flex-col-reverse md:flex-row gap-8 items-center md:items-stretch justify-between ">
                        <div className="h-full p-4 self-stretch w-full flex flex-col gap-4 items-start justify-between">
                           <div>
                              <h2 className="text-lg font-semibold">No Services Purchased!</h2>
                              <p className="text-xs xl:text-sm text-muted-foreground">
                                 You have not purchased any services yet. Explore our offerings and subscribe to get started.
                              </p>

                              <p className="text-xs xl:text-sm text-muted-foreground mt-4">
                                 Once you subscribe to a service, it will appear here with details about your subscription.
                              </p>
                           </div>
                           <Button asChild>
                              <Link href={"/services"} className="hover:!text-legacisGreen"> 
                                 Explore Services <ArrowRightCircle size={20} />
                              </Link>
                           </Button>
                        </div>
                        <Image
                           src="/no-service.png"
                           alt="No services"
                           width={270}
                           height={200}
                           className="mb-4"
                        />
                     </div>
                     {!user.panVerified || !user.emailVerified || !user.phoneVerified &&
                     <div className="max-w-2xl min-h-80 text-white rounded-xl p-4 flex flex-col gap-4 items-start justify-between 
                        bg-neutral-800">
                        <div>
                           <h2 className="text-lg font-semibold">Action Required</h2>
                           <p className="text-xs !text-neutral-100">
                              Please complete your KYC and verify your email and phone number to access all features.
                           </p>
                           <p className="mt-8 text-sm !text-white">Steps to Complete KYC.</p>
                           <ol className="list-decimal list-inside space-y-1 text-xs mt-2 text-neutral-100">
                              <li>Verify your PAN</li>
                              <li>Verify your Email</li>
                              <li>Verify your Phone</li>
                           </ol>
                           
                        </div>
                        <Button variant={'secondary'} className="w-full bg-neutral-100 dark:text-neutral-800" asChild>
                           <Link href="/profile" className="">
                              Complete your KYC <ArrowRightCircle size={20} />
                           </Link>
                        </Button>
                     </div>
                     }
                  </div>
               </section>
            )}  

            {hasRegularService && (
               <section className="p-4 py-8 mt-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl ">
                  <h5 className="text-2xl font-medium mb-4">Subscribed Services</h5>
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4">
                     {userPurchasedServicesOtherThanPortfolioReview.map((service) => {
                        if(service.service?.type === 'COMBO') return null;
                        return (
                           <div
                              key={service.id}
                              className="rounded-xl bg-background border shadow-sm p-4 py-8 pb-4 flex flex-col gap-4 relative"
                           >
                              {service.expiryDate && (
                                 <span className="absolute text-xs top-2 right-2 bg-neutral-300 dark:bg-neutral-700 px-2 py-1 rounded">
                                    <span className="font-medium">Expires:</span> {formatHumanDate(service.expiryDate)}
                                 </span>
                              )}
                              
                              <div className="flex items-start gap-3">
                                 <Image
                                    src='/icons/favicon.ico'
                                    alt={service.service?.name || "Service Icon"}
                                    width={40}
                                    height={40}
                                    className="rounded-full mt-1"
                                 />
                           
                                 <div>
                                    <h3 className="text-lg font-semibold">{service.service?.name}</h3>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{service.service?.tag}</span>
                                 </div>
                              </div>
                              <div className="mt-auto flex gap-2">
                                 {service.service?.type && service.service?.slug && (
                                 <Button variant={'default'} asChild className="w-full">
                                    <Link
                                       href={getServiceLink(service.service.type, service.service.slug)}
                                       className="text-sm font-medium"
                                    >
                                       Explore
                                    </Link>
                                 </Button>
                                 )}
                              </div>
                           </div>
                        )}
                     )}
                  </div>
               </section>
            )}

            {/* Portfolio Review Section */}
            { hasPortfolioReview && 
              <section className="p-4 md:p-8 mt-8 bg-legacisBlue/5 dark:bg-blue-800/5 rounded-2xl ">
                 <h3 className="text-2xl font-medium mb-2">Portfolio Review</h3>
                 <div className="w-full max-h-screen overflow-y-auto">
                       { userPurchasedServicesPortfolio.map((service) => {
                          const portfolioReview = service.portfolioReview;
                          return (
                             <div key={service.id} className="rounded-xl bg-background border mt-8 
                                p-4 pt-12 sm:pt-8 pb-4 flex flex-col gap-4 relative">
                                <div className="flex items-start gap-3">
                                   <Image
                                      src='/icons/favicon.ico'
                                      alt={service.service?.name || "Service Icon"}
                                      width={40}
                                      height={40}
                                      className="rounded-full mt-1"
                                   />
                             
                                   <div>
                                      <h3 className="text-lg font-semibold">
                                         {service.service?.name} for &nbsp;
                                         {(service.grantMetadata as any)?.selectedPlan?.stockLimit || 'Portfolio Review'} Stocks - 
                                         {formatDateWithTime(portfolioReview?.createdAt!)}
                                      </h3>
                                      <span className="text-xs text-muted-foreground uppercase tracking-wide">{service.service?.tag}</span>
                                   </div>
                                </div>
                                <div className="text-xs md:text-lg absolute top-2 right-2">
                                   <span className="font-medium">Status : </span>
                                   {portfolioReview?.status === 'PENDING_UPLOAD' ? (
                                      <Badge className="text-xs md:text-sm bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200">
                                      Pending Upload
                                      </Badge>
                                   ) : portfolioReview?.status === 'UNDER_REVIEW' ? (
                                      <Badge className="text-xs md:text-sm bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                                      Under Review
                                      </Badge>
                                   ) : portfolioReview?.status === 'COMPLETED' ? (
                                      <Badge className="text-xs md:text-sm bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200">
                                      Completed
                                      </Badge>
                                   ) : portfolioReview?.status === 'EXPIRED' ? (
                                      <Badge className="text-xs md:text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                      Expired
                                      </Badge>
                                   ) : (
                                      <Badge className="text-xs md:text-sm bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200">
                                      Failed
                                      </Badge>
                                   )}
                                </div>
                          
                                <div className="flex flex-col md:flex-row gap-8 text-xs mt-8">
                                   <PortfolioReviewFileUpload
                                      className="flex-1 md:w-1/2 dark:bg-transparent dark:border-legacisGreen/70"
                                      prevFileUrl={portfolioReview?.uploadedFileUrl || null}
                                      prevFileName={portfolioReview?.uploadedFileName || null}
                                      plan={service.servicePlan}
                                      userPurchasedServiceId={service.portfolioReview?.userPurchasedServiceId}
                                   />
                                   <div className="relative flex-1 md:w-1/2 flex flex-col gap-2 border border-purple-200 rounded-lg">
                                      {portfolioReview?.status === 'PENDING_UPLOAD' && (
                                         <div className="p-4 flex items-center gap-4">
                                            <p className="text-sm text-muted-foreground">
                                               Please upload your stock list file to get started with the review process.
                                            </p>
                                         </div>
                                      )}
                                      {portfolioReview?.status === 'UNDER_REVIEW' && (
                                         <div className="p-4 flex items-center gap-4">
                                            <ClockLoader className="shrink-0" loading color="var(--text-color)" size={24}/>
                                            <p className="text-sm text-muted-foreground">Your portfolio is currently under review. Please wait for the analysis to complete.</p>
                                         </div>
                                      )}
                                      {portfolioReview?.status === 'COMPLETED' && (
                                         <div className="p-4">
                                            <h4 className="text-sm font-medium mb-2">Portfolio Review Summary</h4>
                                            <div className="text-sm font-medium mb-2"> Reviewed on : &nbsp; 
                                               <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{formatDateWithTime(portfolioReview.updatedAt)}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground my-2">Your portfolio has been successfully reviewed. Please see Download the reviewed report.</p>
                                            <div className="flex flex-col md:flex-row items-end w-full gap-8">
                                               <div className="w-full flex-1">
                                                  <p className="text-sm text-gray-700">Uploaded Stocks File: </p>
                                                  <div className="flex h-10 items-center gap-2 border rounded-sm  px-2 mt-2">
                                                     <File size={32}/>
                                                     <span className="text-sm font-medium">{portfolioReview.reviewedFileName}</span>
                                                  </div>
                                               </div>
                                               <Button
                                                  asChild
                                                  className="w-full flex-1 h-10 border shadow-none"
                                                  variant={'secondary'}
                                               >
                                                  <Link
                                                     href={portfolioReview.reviewedFileUrl || ''}
                                                     rel="noopener noreferrer"
                                                     className="hover:!text-legacisGreen"
                                                     target="_blank"
                                                     download={true}
                                                  >
                                                     Download Reviewed Report
                                                  </Link>
                                               </Button>
                                            </div>
                                         </div>
                                      )}
                                   </div>
                                </div>
                 
                             </div>
                          )
                       })}
                 </div>
              </section>
            }

         {/* Service Recommendation */}
         <section className="p-4 md:p-8 mt-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
            <h3 className="text-2xl font-medium mb-2">Recommended Service only for you!</h3>
            <p className="text-sm flex items-end sm:items-center gap-2">These recommendation are created based on your risk profiling. <span><UserRiskProfileQuestions className="border-0 p-0 text-sm font-medium text-legacisPurple dark:text-legacisGreen bg-transparent dark:bg-transparent hover:dark:bg-transparent shadow-none"/></span></p>
            
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
               {recommendedServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
               ))}
            </div>
        
         </section>
         {/* Why Choose us */}
         <section className="sm:p-4 md:p-8 mt-8">
            <h3 className="text-2xl font-medium mb-2">Why invest with <span className="text-legacisPurple dark:text-legacisGreen">Legacis</span>?</h3>
            <p className="text-sm flex items-end sm:items-center gap-2"> Legacis makes investing simple and transparent, combining expert research and smart strategies to help you grow your wealth with confidence.</p>
            
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
               {dashboardWhyChooseUs.map((item, index) => (
                  <div key={index} className={cn( item.color ,"w-full text-neutral-800 shadow-lg min-h-80 rounded-2xl p-8 flex flex-col items-center justify-center gap-8 relative overflow-clip")}>
                     <Image
                        src={item.image}
                        alt={item.title}
                        width={110}
                        height={110}
                        className="absolute top-2 right-2 border-0"
                     />
                     <h5 className="text-xl font-medium w-full">{item.title}</h5>
                     <p className="!text-neutral-600">{item.description}</p>
                  </div>
               ))}
            </div>
        
         </section>
         {/* Tools */}
         <section className="sm:p-4 md:p-8 mt-8">
            <h3 className="text-2xl font-medium mb-2">Tools to Explore</h3>
            
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
               <div className="w-full flex flex-col md:flex-row items-center gap-8 text-neutral-800 bg-gradient-to-r from-blue-100 to-red-50 p-8 rounded-2xl">
                  <div className="bg-white flex items-center justify-center rounded-xl shadow-xl h-40 w-40 shrink-0">
                     <Calculator size={54} color="var(--legacisTealBlue)"/>
                  </div>
                  <div>
                     <h4 className="font-medium text-lg mb-2">Financial Calculators</h4>
                     <p className="!text-neutral-600 text-sm">Free tools for you to Instantly analyze your investments, savings, and future goals with our free financial calculators. Make smarter decisions with easy-to-use tools tailored for every investor.</p>
                     <span className="flex items-center mt-8">
                        <Link href="/tools" className="p-0 text-base font-normal mr-4 border-0 flex items-center
                        shadow-none bg-transparent hover:bg-transparent
                        dark:shadow-none dark:bg-transparent dark:hover:bg-transparent
                        "> 
                           Tools &nbsp;
                           <ArrowRight size={24}/>
                        </Link>
                     </span>
                  </div>
               </div>
               <div className="w-full flex flex-col md:flex-row items-center gap-8 text-neutral-800 bg-gradient-to-r from-blue-100 to-red-50 p-8 rounded-2xl">
                  <div className="bg-white flex items-center justify-center rounded-xl shadow-xl h-40 w-40 shrink-0">
                     <Presentation size={54} color="var(--legacisTealBlue)"/>
                  </div>
                  <div>
                     <h4 className="font-medium text-lg mb-2">Understand your risk profile</h4>
                     <p className="!text-neutral-600 text-sm">Our risk FREE profiling tool helps you understand your risk appetite and investment preferences, guiding you to make informed decisions.</p>
                     <span className="flex items-center mt-8 hover:!text-legacisGreen">
                        <UserRiskProfileQuestions text="Check your risk profile" className="p-0 text-base font-normal mr-4 border-0
                        hover:!text-legacisGreen
                        shadow-none bg-transparent hover:bg-transparent
                        dark:shadow-none dark:bg-transparent dark:hover:bg-transparent
                        "/> 
                        <ArrowRight size={24} />
                     </span>
                  </div>
               </div>
            </div>
        
         </section>


      </div>
   );
}
export default Page;