import CAGRCalculator from "@/components/tools/cagrCalculator";
import ELSSCalculator from "@/components/tools/elssCalculator";
import FDCalculator from "@/components/tools/fdCalculator";
import LumpsumInvestmentCalculator from "@/components/tools/lumpsumInvestmentCalculator";
import MutualFundReturnCalculator from "@/components/tools/mutualFundReturnCalculator";
import XIRRCalculator from "@/components/tools/xirrCalculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Financial Calculators",
    description: "Explore financial calculators CAGR, ELSS, FD, Lumpsum, Mutual Fund Return, and XIRR to help you make informed investment decisions.",
};


type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

async function Page({ searchParams }: PageProps) {
  const params = await searchParams || {};
  const query = typeof params.calculator === "string" ? params.calculator.toLowerCase() : "";

  function renderCalculator() {
    switch (query) {
      case "cagr":
        return <CAGRCalculator />;
      case "elss":
        return <ELSSCalculator />;
      case "fd":
        return <FDCalculator />;
      case "lumpsum":
        return <LumpsumInvestmentCalculator />;
      case "mutualfund":
        return <MutualFundReturnCalculator />;
      case "xirr":
        return <XIRRCalculator />;
      default:
        return <div className="text-center py-10 text-lg">Please select a calculator from the menu or query.</div>;
    }
  }

  return (
    <main className="w-full px-5 lg:px-10 xl:px-24 py-14 flex items-center justify-center">
      <section className="w-full">
         <Button asChild className="mb-4" variant={'link'}>
            <Link href="/tools" className="flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" />
               Back
            </Link>
         </Button>
         <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full justify-center">
            <div className="max-w-4xl w-full  mb-6 md:mb-0">
               {renderCalculator()}
            </div>
            <div className="w-full md:max-w-xs lg:max-w-sm flex md:shrink-0">
               <div className="rounded-xl p-4 w-full flex flex-col h-full items-center">
                  <div className="relative w-full h-32 md:h-44 mb-auto">
                  <Image
                     src="/explore-services.png"
                     alt="explore services"
                     fill
                     style={{
                        objectFit: "contain",
                        objectPosition: "center"
                     }}
                  />
                  </div>
                  <h1 className="text-lg font-semibold mb-4 md:mb-8 text-center">The Freedom To <br /> Invest Your Way</h1>
                  <Button
                     variant={'default'}
                     asChild
                     size={'sm'}
                     className="w-full rounded-2xl bg-legacisPurple hover:bg-legacisPurple/90 text-white hover:text-neutral-100 "
                  >
                  <Link href="/services" className="w-full hover:!text-neutral-100 text-center">
                     Explore our services
                  </Link>
                  </Button>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
export default Page;