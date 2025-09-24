'use client'
import { ComplimentaryServiceWithService, ServiceData, ServiceWithComplimentary } from '@/lib/data/services'
import { ResearchAdvisoryModelPortfolioStockList, ResearchAdvisoryMutualFundStockList, ResearchAdvisoryStockList, Service, ServiceType, UserPurchasedServices } from '@/prisma/generated/client'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { cn, formatDateWithTime, formatHumanDate, normalizeRationale } from '@/lib/utils'
import { Line } from '../icon'
import { FileBarChart, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PieChart from './PieChart'
import { ChartConfig } from '../ui/chart'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { PDFDisplay } from '../pdfDisplay'
import { generateSectorColor } from '@/lib/utils/generate-sector-color'
import Link from 'next/link'
import Image from 'next/image'
import { QuillHtmlViewer } from '../richTextViewer'


type PurchasedMFServiceData = {
   service : Service;
   purchasedService : UserPurchasedServices | null;
   data : ServiceData;
}

// MF stands for Mutual Fund


const PurchasedServiceSection = ({serviceType, data, mfServiceData}:{serviceType: ServiceType, data?: ServiceData, mfServiceData?: PurchasedMFServiceData[] }) => {

   switch (serviceType) {
      case ServiceType.RESEARCH_ADVISORY:
         return <ServiceResearchAdvisorySection data={data as ResearchAdvisoryStockList[]} />
      case ServiceType.RESEARCH_ADVISORY_MODEL_PORTFOLIO:
         return <ServiceModelPortfolioSection data={data as ResearchAdvisoryModelPortfolioStockList[]} />
      case ServiceType.RESEARCH_ADVISORY_MUTUAL_FUNDS:
         return <ServiceMutualFundSection data={mfServiceData as PurchasedMFServiceData[]} />
      case ServiceType.PORTFOLIO_REVIEW:  
         return(
            <div className='border rounded-2xl p-4 w-full'>
               To get started with your portfolio review. Visit in your &nbsp;
               <Link href={'/dashboard'}>Dashboard</Link>&nbsp;
               and upload your stocks file.
            </div>
         )
      case ServiceType.COMBO:
         return (
            <div className='border rounded-2xl p-4 w-full'>
               <h5 className='text-lg font-medium mb-4'>Services</h5>
               {data && data.length > 0 ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                     {(data as ComplimentaryServiceWithService[]).map((service) => (
                        <div key={service.id} className='border rounded-lg p-4 min-h-44 flex flex-col'>
                           <div className="flex items-start gap-3 mb-auto">
                              <Image
                                 src='/icons/favicon.ico'
                                 alt={service.complimentaryService.name || "Service Icon"}
                                 width={40}
                                 height={40}
                                 className="rounded-full mt-1"
                              />
                              <div>
                                 <h3 className="text-lg font-semibold">{service.complimentaryService.name}</h3>
                                 <span className="text-xs text-muted-foreground uppercase tracking-wide">{service.complimentaryService?.tag}</span>
                              </div>
                           </div>
                           <Button 
                              asChild
                              variant={'secondary'}
                              className='mt-auto'
                           >
                              <Link href={`/services/${service.complimentaryService.slug}`} className=''>
                                 View Service
                              </Link>
                           </Button>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className='text-gray-500'>No complimentary services available.</p>
               )}
            </div>
         )
      default:
         return <div className="text-center text-gray-500">Service type not supported</div>
      
   }
}

export default PurchasedServiceSection




const ServiceResearchAdvisorySection = ({data} : {data : ResearchAdvisoryStockList[]}) => {
   const [activeTab, setActiveTab] = useState<"OPEN" | "CLOSED">("OPEN");

   
   if (!data) {
      return (
         <section className="w-full p-4 border rounded-2xl">
            <div className="text-center text-gray-400 py-8">No calls found.</div>
         </section>
      );
   }
   
   const sortedStocks = data.filter(stock => stock.status === activeTab).sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return dateB - dateA;
   });
   return (
      <section className="w-full p-4 border rounded-2xl max-h-screen overflow-y-auto">
         <div className="flex items-center gap-4 mb-4">
           <Button
             variant={activeTab === "OPEN" ? "default" : "link"}
             onClick={() => setActiveTab("OPEN")}
           >
             Open Calls
           </Button>
           <Button
             variant={activeTab === "CLOSED" ? "default" : "link"}
             onClick={() => setActiveTab("CLOSED")}
           >
             Closed Calls
           </Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-96">
           {sortedStocks.length === 0 ? (
             <div className="col-span-3 text-center text-gray-400 py-8 h-full flex items-center justify-center">No calls found.</div>
           ) : (
             sortedStocks.map((stock, idx) => (
               <StockCard key={stock.stockTicker + stock.entryDate + idx} stock={stock} />
             ))
           )}
         </div>
      </section>
   )
}

const InfoBlock = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs text-neutral-500 dark:text-neutral-300">{label}</span>
    <span className="text-sm font-urbanist font-medium">{value}</span>
  </div>
);

const RationalePopover = ({
  label,
  text,
  showPopover,
  setShowPopover,
  truncate,
}: {
  label: string;
  text: string;
  showPopover: boolean;
  setShowPopover: (v: boolean) => void;
  truncate: (t: string, n: number) => string;
}) => (
  <div className="flex-1 w-full h-10">
    <span className="text-sm font-medium">{label}</span>
    <div className="text-xs text-neutral-500 dark:text-neutral-300">
      {truncate(text, 80)}
      {text.length > 80 && (
        <>
          <Button
            variant={'link'}
            className="text-xs h-auto text-blue-500 dark:text-blue-300 font-normal p-0 m-0"
            onClick={() => setShowPopover(true)}
            type="button"
          >
            Read more
          </Button>
          {showPopover && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-1/5 mt-2 z-10 w-[95%] px-4 py-3 h-auto leading-5 bg-white dark:bg-neutral-800 border rounded-xl shadow-lg text-xs"
              onClick={() => setShowPopover(false)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{label}</span>
                <Button
                  variant={'ghost'}
                  className="text-gray-400 hover:text-gray-600 text-lg h-auto p-0"
                  onClick={() => setShowPopover(false)}
                  type="button"
                >
                  <X size={14} />
                </Button>
              </div>
              <p>{text}</p>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

const StockCard = ({ stock }: { stock: ResearchAdvisoryStockList }) => {
  const [showPopover, setShowPopover] = useState(false);
  const truncate = (text: string, n: number) =>
    text.length > n ? text.slice(0, n) + "..." : text;

  let potential = 0;
  if (stock.entryPrice !== null) {
    const price =
      stock.status === "CLOSED" && stock.exitPrice !== null
        ? stock.exitPrice
        : stock.targetPrice;
    if (price !== null) {
      potential =
        stock.callType === "SELL"
          ? ((stock.entryPrice - price) / stock.entryPrice) * 100
          : ((price - stock.entryPrice) / stock.entryPrice) * 100;
    }
  }

  const rationaleText = normalizeRationale(stock.rationale);
  const exitRationaleText = normalizeRationale(stock.exitRationale);

  const holdingPeriod =
    stock.status === "CLOSED" && stock.entryDate && stock.exitDate
      ? Math.round(
          (new Date(stock.exitDate).getTime() -
            new Date(stock.entryDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const statusLabel =
    stock.status === "OPEN"
      ? "Open"
      : "Closed";
  const statusClass =
    stock.status === "OPEN"
      ? "bg-green-50 dark:bg-green-100/5 border border-green-400 px-2 py-1 rounded text-green-600 dark:text-green-300"
      : "bg-red-50 border border-red-400 px-2 py-1 rounded text-red-500";

  return (
    <div
      className={`w-full relative flex flex-col items-center justify-between rounded-xl 
      ${stock.status === "OPEN"
        ? "bg-green-50/10  dark:bg-neutral-800/50"
        : "bg-neutral-50 dark:bg-neutral-500/5"
      } border`}
    >
      <div className="w-full p-4 ">
        <div className="flex items-center justify-between mb-2">
          <h6 className="!text-xl">{stock.name}</h6>
          <span className={cn(statusClass, "rounded-full text-xs px-4")}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 p-1 px-2 rounded-md">
            <span className="font-semibold">Entry:</span>{" "}
            {formatDateWithTime(stock.entryDate ?? new Date())}
          </span>
          {stock.exitDate && (
            <span className="text-[10px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 ml-4 p-1 px-2 rounded-md">
              <span className="font-semibold">Exit:</span>{" "}
              {formatDateWithTime(stock.exitDate)}
            </span>
          )}
        </div>
        <Line color="var(--text-color)" className="opacity-40" height="1px" width="100%" />
        <div className="grid grid-cols-3 gap-6 items-center justify-between py-2 mt-4">
          <InfoBlock label="Entry Price" value={`₹${stock.entryPrice}`} />
          <InfoBlock label="Target Price" value={`₹${stock.targetPrice}`} />
          {stock.status !== "CLOSED" ? (
            <InfoBlock label="Stop Loss" value={`₹${stock.stopLoss}`} />
          ) : (
            <InfoBlock label="Exit Price" value={`₹${stock.exitPrice}`} />
          )}
          {stock.status === "CLOSED" && (
            <InfoBlock label="Holding Period" value={`${holdingPeriod} Days`} />
          )}
          <InfoBlock
            label={stock.status === "CLOSED" ? "Net Gain" : "Potential"}
            value={
              <span
                className={`text-sm font-urbanist font-medium ${
                  potential > 0
                    ? "text-green-600 dark:text-green-300"
                    : potential < 0
                    ? "text-red-600"
                    : "text-neutral-600"
                }`}
              >
                {potential > 0 ? "+" : ""}
                {potential.toFixed(2)}%
              </span>
            }
          />
         {stock.raReport && (
            <div className='flex flex-col items-start'>
               <span className='text-xs text-neutral-500 dark:text-neutral-300 text-nowrap'>Research Report</span>
               <Dialog>
                  <DialogTrigger asChild className='text-left'>
                     <Button variant={'ghost'} size={'sm'} className='text-left  items-end flex gap-2 p-0 text-xs'>
                       <FileBarChart className='inline' size={14}/>
                        View
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-5xl ">
                     <DialogHeader>
                        <DialogTitle>{stock.name} Research Report</DialogTitle>
                     </DialogHeader>
                     <PDFDisplay fileUrl={stock.raReport}/>
                  </DialogContent>
               </Dialog>
            </div>
         )}
        </div>
        <div className="flex items-start justify-between py-2 pb-4 gap-4">
          {stock.status === "CLOSED" ? (
            <RationalePopover
              label="Exit Rationale"
              text={exitRationaleText.text}
              showPopover={showPopover}
              setShowPopover={setShowPopover}
              truncate={truncate}
            />
          ) : (
            <RationalePopover
              label="Rationale"
              text={rationaleText.text}
              showPopover={showPopover}
              setShowPopover={setShowPopover}
              truncate={truncate}
            />
          )}
        </div>
      </div>
      <Line color="var(--text-color)" className="opacity-40" height="1px" width="100%" />
      {stock.status !== "CLOSED" && (
        <div
          className={`w-full mt-2 ${
            stock.callType === "BUY"
              ? "bg-legacisGreen/10"
              : "bg-legacisPink/10"
          } p-4 flex items-center justify-center rounded-b-xl`}
        >
          <span
            className={`${
              stock.callType === "BUY"
                ? "text-green-600 dark:text-green-300"
                : "text-red-600 dark:text-red-400"
            } uppercase tracking-widest text-lg font-medium`}
          >
            {stock.callType}
          </span>
        </div>
      )}
    </div>
  );
};


//Serive Model Portfolio Section
const ServiceModelPortfolioSection = ({data} : {data : ResearchAdvisoryModelPortfolioStockList[]}) => {
   const AMOUNT_STORAGE_KEY = "model_portfolio_amount";
   
   const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return dateA - dateB;
   });

   const [amount, setAmount] = useState<number>(()=>{
      if (typeof window !== "undefined") {
         const stored = localStorage.getItem(AMOUNT_STORAGE_KEY);
         if (stored) return Number(stored);
      }
      return 100000; // Default amount
   });

   useEffect(() => {
      if (typeof window !== "undefined") {
         localStorage.setItem(AMOUNT_STORAGE_KEY, String(amount));
      }
   }, [amount]);

   const sectorCounts: Record<string, number> = {};
   sortedData.forEach(stock => {
     const sector = stock.sector || "Unknown";
     sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
   });

   // 2. Calculate total and percentages
   const total = sortedData.length;
   const pieData = Object.entries(sectorCounts).map(([sector, count], i) => ({
     name: sector,
     value: (count / total) * 100,
     fill: generateSectorColor(sector, i),
     stocks: count,
   }));

   const chartConfig = {
     title: "Stocks by Sector",
     // ...other config if needed
   } as ChartConfig;

   if (!sortedData) {
      return (
         <section className="w-full p-4 border rounded-2xl">
            <div className="text-center text-gray-400 py-8">No model portfolio stocks found.</div>
         </section>
      );
   }

  const totalWeight = sortedData.reduce((sum, stock) => sum + (stock.portfolioWeight || 0), 0);
  const unknownWeight = Math.max(0, 100 - totalWeight);

   // Only show table if amount is entered and > 0
   const showTable = amount > 0;

   return (
      <section className="w-full">
         <div className="flex flex-col lg:flex-row p-4 gap-8 border rounded-2xl">
            <div className='max-w-xl w-full flex-1 '>
                <h6 className='font-medium'>Sector</h6>
               <PieChart data={pieData} chartConfig={chartConfig} />
            </div>
            <div className='p-4 rounded-xl border w-full flex-1'>
               <div className='flex items-end gap-4 mb-4'>
                  <Input
                     type='number'
                     placeholder='Enter your amount!'
                     className='border-b border-legacisPurple dark:border-legacisGreen w-52'
                     min={0}
                     onChange={(e) => setAmount(Number(e.target.value))}
                     value={amount}
                  />
                  <span className='text-sm'>
                     Enter your amount to see the allocation
                  </span>
               </div>

               {showTable ? (
                     <Table >
                        <TableHeader>
                           <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>StockTicker</TableHead>
                              <TableHead>Sector</TableHead>
                              <TableHead>Weight (%)</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Research Report</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {sortedData.map((stock, idx) => (
                              <TableRow  key={stock.stockTicker + idx}>
                                 <TableCell>{idx + 1}</TableCell>
                                 <TableCell className="font-medium">{stock.name}</TableCell>
                                 <TableCell>{stock.stockTicker}</TableCell>
                                 <TableCell>{stock.sector}</TableCell>
                                 <TableCell>{stock.portfolioWeight}%</TableCell>
                                 <TableCell>
                                    ₹{((amount * stock.portfolioWeight) / 100).toLocaleString("en-IN", {maximumFractionDigits: 2})}
                                 </TableCell>
                                 <TableCell>
                                    <Dialog>
                                       <DialogTrigger asChild>
                                          <Button variant="outline">
                                             View
                                          </Button>
                                       </DialogTrigger>
                                       <DialogContent className="sm:max-w-5xl">
                                          <DialogHeader>
                                             <DialogTitle>{stock.name} Research Report</DialogTitle>
                                          </DialogHeader>
                                          <PDFDisplay fileUrl={stock.researchReport!}/>
                                       </DialogContent>
                                    </Dialog>
                                 </TableCell>
                              </TableRow>
                           ))}

                           {unknownWeight > 0 && (
                           <TableRow>
                              <TableCell>-</TableCell>
                              <TableCell className="font-medium text-gray-500">Cash</TableCell>
                              <TableCell className="font-medium text-gray-500">-</TableCell>
                              <TableCell className="font-medium text-gray-500">-</TableCell>
                              <TableCell>{unknownWeight.toFixed(2)}%</TableCell>
                              <TableCell>
                                ₹{((amount * unknownWeight) / 100).toLocaleString("en-IN", {maximumFractionDigits: 2})}
                              </TableCell>
                              <TableCell>-</TableCell>
                           </TableRow>
                        )}
                        </TableBody>
                     </Table>
                     ) : (
                  <div className="col-span-3 text-center text-gray-400 py-8">Enter an amount to see allocation.</div>
               )}
            </div>
         </div>
      </section>
   )
}

// Service Mutual Fund Section
function isMutualFundStockListArray(
  arr: unknown
): arr is ResearchAdvisoryMutualFundStockList[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "category" in item &&
        "weight" in item
    )
  );
}



const ServiceMutualFundSection = ({data} : {data : PurchasedMFServiceData[]}) => {
   const AMOUNTS_STORAGE_KEY = "mf_amounts";

   const [amounts, setAmounts] = useState<{ [key: string]: number }>(() => {
      if (typeof window !== "undefined") {
         const stored = localStorage.getItem(AMOUNTS_STORAGE_KEY);
         if (stored) return JSON.parse(stored);
      }
      return {};
   });

   useEffect(() => {
      if (typeof window !== "undefined") {
         localStorage.setItem(AMOUNTS_STORAGE_KEY, JSON.stringify(amounts));
      }
   }, [amounts]);

   const handleAmountChange = (key: string, value: number) => {
      setAmounts((prev) => ({ ...prev, [key]: value }));
   };
   const totalAmount = Object.values(amounts).reduce((sum, val) => sum + (val || 0), 0);
   
   const categoryTotals: Record<string, number> = {};

   data.forEach((mfData) => {
   const amount = amounts[mfData.service.id] || 0;
   if (amount > 0 && isMutualFundStockListArray(mfData.data)) {
      mfData.data.forEach((stock : ResearchAdvisoryMutualFundStockList) => {
         if (!stock.category) return;
         const allocation = (amount * stock.weight) / 100;
         categoryTotals[stock.category] = (categoryTotals[stock.category] || 0) + allocation;
      });
   }
   });

   const totalInvested = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

   const pieData = Object.entries(categoryTotals).map(([category, value], i) => ({
      name: category,
      value: totalInvested > 0 ? (value / totalInvested) * 100 : 0,
      fill: generateSectorColor(category, i),
      amount: value,
   }));

   const chartConfig = {
     title: "Stocks by Category",
   } as ChartConfig;


   return (
      <section className='w-full flex flex-col xl:flex-row items-start gap-8 relative'>
         {totalAmount > 0 ? (   
            <div className='xl:max-w-lg 2xl:max-w-xl w-full flex-1 xl:sticky top-28 z-10 p-4 rounded-xl border border-pink-100 dark:border-pink-100/50'>
               <div className="mb-4 flex justify-between font-medium">
                  <span>Category</span>
                  <span>
                     Total Amount: ₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
               </div>
               <PieChart 
                  data={pieData} 
                  containerClassName='flex flex-col sm:flex-row xl:flex-col w-full' 
                  className='sm:max-w-sm md:max-w-md lg:max-w-xl' 
                  height={250} 
                  chartConfig={chartConfig} 
               />
            </div>
         ):(
         <div className='xl:max-w-lg 2xl:max-w-xl w-full min-h-96 flex-1 xl:sticky top-24 z-10 p-4 rounded-xl border flex items-center justify-center'>
          <span className='text-xs'>No Graph to show</span>
         </div>
         )
         }
         {data.length > 0 ? (
           <div className='w-full max-w-7xl overflow-x-auto flex-1'>
               {data.map((mfData, idx) => (
                  <div key={mfData.service.id + idx} className="w-full mb-8 last:mb-0 rounded-2xl">
                     <h5 className='text-lg font-medium mb-4'>{mfData.service.name} Stock List</h5>
                     <MFCardList 
                        data={mfData.data as ResearchAdvisoryMutualFundStockList[]}
                        amount={amounts[mfData.service.id] || 0}
                        setAmount={(val: number) => handleAmountChange(mfData.service.id, val)}
                     />
                  </div>
               ))}
           </div>

         ) :(
            <div className="w-full p-4 border rounded-2xl">
               <div className="text-center text-gray-400 py-8">No mutual fund stocks found.</div>
            </div>
         )}
      </section>
   )
}


const MFCardList = ({data, amount, setAmount} : {data : ResearchAdvisoryMutualFundStockList[]; amount: number; setAmount: (val:number)=> void}) => {
   // Sort stocks by createdAt date (newest first)
   const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return dateB - dateA;
   });

   const totalWeight = data.reduce((sum, stock) => sum + (stock.weight || 0), 0);
   const unknownWeight = Math.max(0, 100 - totalWeight);
   const showTable = amount > 0;
   useEffect(() => {
      if (amount === 0) setAmount(100000);
   }, [amount, setAmount]);
   return (
     <div className='p-4 rounded-xl border border-pink-100 dark:border-pink-100/50 w-full flex-1'>
         <div className='flex items-end gap-4 mb-4'>
            <Input
               type='number'
               placeholder='Enter your amount!'
               className='border-b border-legacisPurple dark:border-legacisGreen w-52'
               min={0}
               onChange={(e) => setAmount(Number(e.target.value))}
               value={amount}
            />
            <span className='text-xs sm:text-sm'>
               Enter your amount to see the allocation
            </span>
         </div>
      
         {showTable ? (
          <Table >
             <TableHeader>
                <TableRow>
                   <TableHead>#</TableHead>
                   <TableHead>Name</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead>Weight (%)</TableHead>
                   <TableHead>Amount</TableHead>
                   <TableHead>Rationale</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {sortedData.map((stock, idx) => {
                  const rationaleText = normalizeRationale(stock.rationale);
                  return (
                   <TableRow  key={stock.id + idx} className='text-xs sm:text-sm'>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{stock.name}</TableCell>
                      <TableCell>{stock.category}</TableCell>
                      <TableCell>{stock.weight} %</TableCell>
                      <TableCell>
                         ₹{((amount * stock.weight) / 100).toLocaleString("en-IN", {maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                       {(rationaleText.text).length > 80 && (
                           <Dialog>
                              <DialogTrigger asChild>
                                 <Button
                                    variant={'outline'}
                                    type="button"
                                 >
                                    View Rationale
                                 </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-2xl">
                                 <DialogHeader>
                                    <DialogTitle>{stock.name} rationale</DialogTitle>
                                    <DialogDescription>
                                       {rationaleText.text}
                                    </DialogDescription>
                                 </DialogHeader>
                              </DialogContent>
                           </Dialog>
                        )}
                          
                      </TableCell>
                   </TableRow>
                )})}
                {unknownWeight > 0 && (
                <TableRow>
                   <TableCell>-</TableCell>
                   <TableCell className="font-medium text-gray-500">Cash</TableCell>
                   <TableCell className="font-medium text-gray-500">-</TableCell>
                   <TableCell>{unknownWeight.toFixed(2)}%</TableCell>
                   <TableCell>
                     ₹{((amount * unknownWeight) / 100).toLocaleString("en-IN", {maximumFractionDigits: 2})}
                   </TableCell>
                   <TableCell>-</TableCell>
                </TableRow>
             )}
             </TableBody>
          </Table>
          ) : (
         <div className="col-span-3 text-center text-gray-400 py-8">Enter an amount to see allocation.</div>
        )}
      </div>
   )
}