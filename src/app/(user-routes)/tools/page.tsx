import Image from "next/image";
import Link from "next/link";
import { ChartNoAxesCombined } from 'lucide-react';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Financial Calculators",
    description: "Explore our range of financial calculators designed to meet your investment needs.",
};

async function Page() {
  const calculators = [
  {
    type: "cagr",
    name: "CAGR",
    desc: "Calculate Compound Annual Growth Rate for your investments.",
  },
  {
    type: "elss",
    name: "ELSS",
    desc: "Estimate returns from Equity Linked Savings Scheme.",
  },
  {
    type: "fd",
    name: "FD",
    desc: "Find maturity amount for Fixed Deposits with various compounding options.",
  },
  {
    type: "lumpsum",
    name: "Lumpsum",
    desc: "Calculate future value of a one-time mutual fund investment.",
  },
  {
    type: "mutualfund",
    name: "Mutual Fund Return",
    desc: "Estimate returns for mutual fund investments over time.",
  },
  {
    type: "xirr",
    name: "XIRR",
    desc: "Calculate annualized returns for irregular cash flows.",
  },
]; 
 
  return (
      <main className="w-full h-full px-5 lg:px-10 xl:px-24 py-14">
         <h1 className="text-2xl font-medium mb-6">Financial Calculators</h1>
         <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4    gap-8 mb-10">
            {calculators.map(calc => (
               <Link
                  key={calc.type}
                  href={`/tools/calculator?calculator=${calc.type}`}
                  className="relative rounded-sm bg-white dark:bg-neutral-800 shadow-xl shadow-legacisPurple/20 dark:shadow-legacisGreen/10 hover:shadow-lg transition p-5 h-52 w-full "
               >
                  <div className="font-medium text-lg mb-2">{calc.name}</div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{calc.desc}</p>
                  {/* <Image
                     src="/profit-growth.png"
                     alt="profit growth"
                     width={50}
                     height={50}
                     className="absolute bottom-1 right-1 z-10 opacity-20"     
                  /> */}
                  <ChartNoAxesCombined className="absolute bottom-1 right-1 w-10 h-10 text-inherit opacity-50" />
               </Link>
            ))}
         </section>
 
      </main>
  );
}
export default Page;