'use client'
import { ServiceData } from '@/lib/data/services'
import { ServiceType } from '@/prisma/generated/client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { cn, formatHumanDate } from '@/lib/utils'
import { Line } from '../icon'
import { StockList } from '@/types/service'
import { X } from 'lucide-react'

const PurchasedServiceSection = ({serviceType, data}:{serviceType : ServiceType, data : ServiceData}) => {
   switch (serviceType) {
      case ServiceType.TRADING:
         return <ServiceTradingSection data={data} />
      default:
         return <div className="text-center text-gray-500">Service type not supported</div>
      
   }
}

export default PurchasedServiceSection



const ServiceTradingSection = ({data} : {data : ServiceData}) => {
   const [activeTab, setActiveTab] = useState<"OPEN" | "CLOSED">("OPEN");
   const exampleStock: StockList[] = [
  {
    name: "Tatatech",
    symbol: "TATH",
    status: "OPEN",
    side: "BUY", 
    entryDate: "2025-06-06T14:30:00Z",
    entryPrice: 1000,
    targetPrice: 1200,
    stopLoss: 900,
    rationale: "Strong fundamentals and positive earnings outlook.Use this API to verify if a given PAN exists. You will receive the name registered with the PAN and the PAN type (Individual or Business) in the response for a valid PAN. View the test data and use the information to trigger the validations. The test data are usable only in the test environment sandbox.",
    exitRationale: "Target achieved, booking profits." 
   },
  {
    name: "Reliance",
    symbol: "RELI",
    status: "OPEN",
    side: "SELL",
    entryDate: "2025-06-05T10:00:00Z",
    entryPrice: 2800,
    targetPrice: 2500,
    stopLoss: 2900,
    rationale: "Diversified business and robust growth in retail segment.",
    exitRationale: "Target achieved, booking profits."
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    status: "CLOSED",
    side: "BUY", 
    entryDate: "2025-05-28T09:15:00Z",
    entryPrice: 1600,
    targetPrice: 1750,
    stopLoss: 1550,
    rationale: "Closed after hitting target. Consistent performer in banking sector.",
    exitDate: "2025-06-01T15:00:00Z",
    exitRationale: "Strong fundamentals and positive earnings outlook.Use this API to verify if a given PAN exists. You will receive the name registered with the PAN and the PAN type (Individual or Business) in the response for a valid PAN. View the test data and use the information to trigger the validations. The test data are usable only in the test environment sandbox."
  },
  {
    name: "Infosys",
    symbol: "INFY",
    status: "OPEN",
    entryDate: "2025-06-03T13:00:00Z",
    side: "BUY", 
    entryPrice: 1400,
    targetPrice: 1550,
    stopLoss: 1350,
    rationale: "Strong order book and digital transformation tailwinds.",
    exitRationale: "Target achieved, booking profits."
  },
  {
    name: "Maruti Suzuki",
    symbol: "MARUTI",
    status: "CLOSED",
    side: "BUY", 
    entryDate: "2025-05-20T11:45:00Z",
    entryPrice: 9000,
    targetPrice: 9500,
    stopLoss: 8800,
    rationale: "Closed after stop loss triggered. Monitor for re-entry.",
    exitDate: "2025-05-25T10:00:00Z",
    exitRationale: "Stop loss hit, exited position."
  }
];

   const filteredStocks = exampleStock.filter(stock => stock.status === activeTab);
   return (
      <section className="w-full p-4 border rounded-2xl">
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
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredStocks.length === 0 ? (
             <div className="col-span-3 text-center text-gray-400 py-8">No calls found.</div>
           ) : (
             filteredStocks.map((stock) => (
               <StockCard key={stock.symbol + stock.entryDate} stock={stock} />
             ))
           )}
         </div>
      </section>
   )
}

const StockCard = ({ stock }: { stock: StockList }) => {
   const [showPopover, setShowPopover] = useState(false);
   const truncate = (text: string, n: number) =>
    text.length > n ? text.slice(0, n) + "..." : text;
   const potential = stock.side === "SELL"
  ? ((stock.entryPrice - stock.targetPrice) / stock.entryPrice) * 100
  : ((stock.targetPrice - stock.entryPrice) / stock.entryPrice) * 100;
  return (
    <div className={`w-full relative flex flex-col items-center justify-between rounded-xl ${stock.status === 'OPEN' ? 'bg-green-50/50  dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-500/5' } border`}>
      <div className="w-full p-4 ">
         <div className="flex items-center justify-between mb-2">
         <h6 className='!text-xl'>{stock.name}</h6>
         <span
            className={cn(
               stock.status === "OPEN"
               ? "bg-green-50 dark:bg-green-100/5 border border-green-400 px-2 py-1 rounded text-green-600 dark:text-green-300 "
               : "bg-red-50 border border-red-400 px-2 py-1 rounded text-red-500", "rounded-full text-xs px-4" )
            }
         >
            {stock.status === "OPEN" ? "Open" : "Closed"}
         </span>
         </div>
         <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 p-1 px-2 rounded-md">
            <span className='font-semibold'>Entry:</span>{" "}
            {new Date(stock.entryDate).toLocaleString("en-IN", {
               year: "numeric",
               month: "short",
               day: "2-digit",
               hour: "2-digit",
               minute: "2-digit",
               hour12: false,
            })}
         </span>
         {stock.exitDate && (
            <span className="text-[10px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 ml-4 p-1 px-2 rounded-md">
               <span className='font-semibold'>Exit:</span>{" "}
               {new Date(stock.exitDate).toLocaleString("en-IN", {
               year: "numeric",
               month: "short",
               day: "2-digit",
               hour: "2-digit",
               minute: "2-digit",
               hour12: false,
               })}
            </span>
         )}
         </div>
         <Line color='var(--text-color)' className='opacity-40' height="1px" width="100%" />
         <div className="grid grid-cols-3 gap-6 items-center justify-between py-2 mt-4">
            <div className="flex flex-col gap-2">
               <span className="text-xs text-neutral-500 dark:text-neutral-300 ">Entry Price</span>
               <span className="text-sm font-urbanist font-medium">₹{stock.entryPrice}</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-xs text-neutral-500 dark:text-neutral-300">Target Price</span>
               <span className="text-sm font-urbanist font-medium">₹{stock.targetPrice}</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-xs text-neutral-500 dark:text-neutral-300">Stop Loss</span>
               <span className="text-sm font-urbanist font-medium">₹{stock.stopLoss}</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-xs text-neutral-500 dark:text-neutral-300">Potential</span>
               <span
                 className={`text-sm font-urbanist font-medium ${
                   (stock.side === "SELL" && potential > 0) ||
                   (stock.side !== "SELL" && potential > 0)
                     ? "text-green-600 dark:text-green-300"
                     : potential < 0
                     ? "text-red-600"
                     : "text-neutral-600"
                 }`}
               >
                 {potential > 0 ? "+" : ""}
                 {potential.toFixed(2)}%
               </span>
            </div>
         </div>
         <div className="flex items-start justify-between py-2 pb-4 gap-4">
         {stock.status === "CLOSED" ? (
            <div className="flex-1 w-full h-10">
               <span className="text-sm font-medium">Exit Rationale</span>
               <div className="text-xs text-neutral-500 dark:text-neutral-300">
                  {truncate(stock.exitRationale  ?? "", 80)}
                  {(stock.exitRationale ?? "").length > 80 && (
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
                        className="absolute left-1/2 -translate-x-1/2 top-1/5 mt-2 z-10 w-full px-4 py-3 h-auto leading-5 bg-white dark:bg-neutral-800 border rounded-xl shadow-lg text-xs"
                        onClick={() => setShowPopover(false)}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-medium">Exit Rationale</span>
                           <Button
                           variant={'ghost'}
                           className="text-gray-400 hover:text-gray-600 text-lg h-auto p-0"
                           onClick={() => setShowPopover(false)}
                           type="button"
                           >
                           <X size={14}/>
                           </Button>
                        </div>
                        <p>{stock.exitRationale}</p>
                     </div>
                     )}
                  </>
               )}
               </div>
            </div>
         ) : (
            <div className="flex-1 w-full h-10">
               <span className="text-sm font-medium">Rationale</span>
               <div className="text-xs text-neutral-500 dark:text-neutral-300">
                  {truncate(stock.rationale, 80)}
                  {stock.rationale.length > 80 && (
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
                        className="absolute left-1/2 -translate-x-1/2 top-1/5 mt-2 z-10 w-full px-4 py-3 h-auto leading-5 tracking-wide bg-white dark:bg-neutral-700 border rounded-xl shadow-lg text-xs"
                        onClick={() => setShowPopover(false)}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-medium">Rationale</span>
                           <Button
                           variant={'ghost'}
                           className="text-gray-400 hover:text-gray-600 text-lg h-auto p-0"
                           onClick={() => setShowPopover(false)}
                           type="button"
                           >
                           <X size={14}/>
                           </Button>
                        </div>
                        <p>{stock.rationale}</p>
                     </div>
                     )}
                  </>
               )}
               </div>
            </div>
         )}
         </div>
      </div>
         <Line color='var(--text-color)' className='opacity-40' height="1px" width="100%" />
      {stock.status !== "CLOSED" && (
         stock.side === "BUY" ? (
           <div className='w-full mt-2 bg-legacisGreen/10 p-4 flex items-center justify-center rounded-b-xl'>
               <span className="text-green-600 dark:text-green-300 uppercase tracking-widest text-lg font-medium">{stock.side}</span>
           </div>
         ):(
           <div className='w-full mt-2 bg-legacisPink/10 p-4 flex items-center justify-center rounded-b-xl'>
               <span className="text-red-600 dark:text-red-400 uppercase tracking-widest text-lg font-medium">{stock.side}</span>
           </div>
         )
      )}
    </div>
  );
};
