import { UserPlatinaRecommendationWithDetails } from "@/lib/data/platina"
import { PlatinaStockList } from "@/types/service";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn, formatHumanDate } from "@/lib/utils";
import { UserPlatinaStockList } from "@/prisma/generated/client";
import STYLE from '@/app/platina-wealth/platina.module.css'
import PlatinaPieChart from "./platinaPieChart";
import PlatinaSimpleLineChart from "./platinaLineChart";
import { Line } from "../icon";
import { PDFDisplay } from "../pdfDisplay";
import { QuillHtmlViewer } from "../richTextViewer";


function generateSectorColor(sectorName: string, index: number): string {
  const baseColors = [
    "#7FF4D3", "#60A5FA", "#FCD34D", "#F87171", "#A78BFA", 
    "#67E8F9", "#FB923C", "#A3E635", "#F472B6", "#6EE7B7"
  ];
  
  if (index < baseColors.length) {
    return baseColors[index];
  }
  
  // Create a simple hash from sector name for consistent colors
  let hash = 0;
  for (let i = 0; i < sectorName.length; i++) {
    const char = sectorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to generate consistent colors
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 70 + (Math.abs(hash) % 15);  // 70-85%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


function getMarketCapCategory(marketCapInCrore: number): string {
  if (marketCapInCrore >= 100000) {
    return 'Mega Cap';
  } else if (marketCapInCrore >= 20000) {
    return 'Large Cap';
  } else if (marketCapInCrore >= 5000) {
    return 'Mid Cap';
  } else if (marketCapInCrore >= 500) {
    return 'Small Cap';
  } else {
    return 'Micro Cap';
  }
}


export const PlatinaServiceCard = ({userRecommendation}:{userRecommendation: UserPlatinaRecommendationWithDetails}) => {
   const {riskProfile, platinaService, stocks, notes, recommendationDate, userInvestmentAmount, peChart, epsChart, rationale} = userRecommendation || {};
   // const stockList = stockRecommendations as PlatinaStockList[];
      
   return (
      <> 
         <PlatinaPortfolioUpdates recomendationDate={recommendationDate|| null} userInvestmentAmount={userInvestmentAmount || null} rationale={rationale}/>
         <PlatinaStockListTable stockList ={stocks || []} notes={notes || ''}/>
         <PlatinaPieCharts stockList={stocks || []}/>
         <PlatinaLineCharts peChart={peChart} epsChart={epsChart}/>
      </>
   )
}

const PlatinaStockListTable = ({stockList, notes = ''}:{stockList: UserPlatinaStockList[], notes: string}) => {
  return(
      <div className={`w-full border border-platina/70 rounded-2xl p-4 flex flex-col mb-8`}>
          <h6 className="mb-4"> Current Portfolio Recommendations </h6>
          <Table containerClass={cn(STYLE.platina_scrollbar)} className="">
            <TableCaption className="mb-4">
               <p className="text-xs">Notes: {notes || "No additional notes"}</p>
            </TableCaption>
            <TableHeader>
               <TableRow className="text-sm">
                 <TableHead>&nbsp;</TableHead>
                 <TableHead className="w-[100px]">Company Name</TableHead>
                 <TableHead>Stock Ticker</TableHead>
                 <TableHead>Sector</TableHead>
                 <TableHead>Portfolio Weight</TableHead>
                 <TableHead>Total Shares</TableHead>
                 <TableHead>Current Share Price</TableHead>
                 <TableHead>Purchase Amount</TableHead>
                 <TableHead>PE Ratio</TableHead>
                 <TableHead>Market Cap (in cr.)</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
          {stockList.map((stock, index) => (
            <TableRow key={index} className="text-xs">
               <TableCell className="text-center">{index + 1}</TableCell>
               <TableCell className="font-medium">{stock.stockName}</TableCell>
               <TableCell>{stock.stockTicker}</TableCell>
               <TableCell>{stock.sector}</TableCell>
               <TableCell>{stock.portfolioWeight}%</TableCell>
               <TableCell>{stock.totalShares}</TableCell>
               <TableCell className="font-urbanist">₹{stock.currentSharePrice.toFixed(2)}</TableCell>
               <TableCell className="font-urbanist">₹{stock.purchaseAmount.toFixed(2)}</TableCell>
               <TableCell>{stock.PEratio}</TableCell>
               <TableCell className="font-urbanist">₹{stock.marketCapInCrore} Cr</TableCell>
            </TableRow>
          ))}

         </TableBody>
       </Table>
      </div>
   )
}

const PlatinaPortfolioUpdates =({recomendationDate, userInvestmentAmount, rationale}:{recomendationDate : Date | null, userInvestmentAmount : number | null, rationale: any })=> {
   return (
      <div className="w-full border border-platina/70 rounded-2xl p-4 flex flex-col mb-8">
         <div className="flex flex-row items-center justify-between gap-2">
            <p className="text-sm">Next Review Date: <span className="text-base">{formatHumanDate(recomendationDate!)}</span></p>
            <p className="text-sm">Investment Amount: <span className="font-urbanist font-semibold text-lg">₹{userInvestmentAmount?.toLocaleString()}</span></p>
            <Dialog>
              <DialogTrigger>View Rationale</DialogTrigger>
              <DialogContent className="max-h-[80vh] w-[calc(100%-14px)] max-w-3xl h-full overflow-y-auto overflow-x-hidden p-4">
                  <DialogTitle>&nbsp;</DialogTitle>
                  <QuillHtmlViewer delta={rationale} className="text-sm" />
              </DialogContent>
            </Dialog>
         </div>
      </div>
   )
}

const PlatinaPieCharts =({stockList}:{stockList: UserPlatinaStockList[]})=>{
    const createPieData = (
        keyExtractor: (stock: UserPlatinaStockList) => string,
        colorMap?: Record<string, string>
    ) => {
        const dataMap = stockList.reduce((acc, stock) => {
            const key = keyExtractor(stock);
            if (acc[key]) {
                acc[key] += stock.portfolioWeight;
            } else {
                acc[key] = stock.portfolioWeight;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(dataMap)
            .map(([name, weight], index) => ({
                name,
                value: weight,
                fill: colorMap?.[name] || generateSectorColor(name, index),
                stocks: stockList.filter(s => keyExtractor(s) === name).length
            }))
            .sort((a, b) => b.value - a.value);
    };
 
   
   
   const sectorData = () => createPieData(stock => stock.sector);
   const marketCapData = () => createPieData(
      stock => getMarketCapCategory(stock.marketCapInCrore),
      {
        'Mega Cap': '#7FF4D3',
        'Large Cap': '#60A5FA',
        'Mid Cap': '#FCD34D',
        'Small Cap': '#F87171',
        'Micro Cap': '#A78BFA'
      }
   );

  const chartConfig = {
    sectors: { label: "Allocation" },
  }


   return(
      <div className="w-full flex flex-col lg:flex-row gap-8 sm:border sm:border-platina/70 rounded-2xl sm:p-4 mb-8">
         <div className="w-full flex-1 p-4 border border-platina/80 rounded-2xl">
            <h6 className="mb-4">Sector Allocation</h6>
            <PlatinaPieChart data={sectorData()} chartConfig={chartConfig}/>
         </div>
          <div className="w-full flex-1 p-4 border border-platina/80 rounded-2xl">
            <h6 className="mb-4">Market Capital Allocation</h6>
            <PlatinaPieChart data={marketCapData()} chartConfig={chartConfig}/>
          </div>
      </div>
   )
}

const PlatinaLineCharts=({peChart, epsChart}:{peChart : any, epsChart: any})=>{
   const chartConfig = {
      value:{
         label: "Performance",
         color: "#4AEDB9",
      }
   }

   return (
      <div className="w-full flex flex-col lg:flex-row gap-8 sm:border sm:border-platina/70 rounded-2xl sm:p-4 mb-8">
         <div className="w-full flex-1 p-4 border border-platina/80 rounded-2xl">
            <h6 className="mb-4">Price to Earnings (PE) Ratio</h6>
            <PlatinaSimpleLineChart data={peChart} color="#c080ff" title={'PE (Price to Earning) Average %'}/>
         </div>
         <div className="w-full flex-1 p-4 border border-platina/80 rounded-2xl">
            <h6 className="mb-4">Earnings Per Share (EPS) Growth Rate</h6>
            <PlatinaSimpleLineChart data={epsChart} color="#ff8afb" title={chartConfig.value.label}/>
         </div>
      </div>
   )
}

export const PlatinaPendingStage = ({ 
   serviceName, 
   expiryDate 
}: { 
   serviceName: string; 
   expiryDate: Date 
}) => {
   return (
      <div className="w-full rounded-2xl border border-platina/70 bg-gradient-to-br from-green-50/50 to-platina/10 dark:from-green-950/30 dark:to-platina/5 p-6 md:p-8 mb-8">
         {/* Header Section */}
         <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <div>
               <h6 className="text-base font-semibold text-green-600 dark:text-green-400">Successfully Subscribed!</h6>
               <p className="text-sm text-gray-600 dark:text-gray-300">{serviceName}</p>
            </div>
         </div>

         {/* Subscription Details */}
         <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4 border border-platina/30 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subscription Valid Until</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
               {formatHumanDate(expiryDate)}
            </p>
         </div>

         <Line color="var(--text-color)" height="1px" className="self-stretch opacity-20 mb-4"/>

         {/* Status Message */}
         <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="flex space-x-1">
               <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
               <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
               <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
               </div>
               <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Preparing Your Recommendations</p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
               Your personalized portfolio recommendations are being prepared by our research team and will be available shortly.
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
               We will notify you via email once your recommendations are ready.
            </p>
         </div>

         {/* Thank You Message */}
         <div className="mt-6 pt-4 border-t border-platina/20 dark:border-gray-700/50 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-200">
               Thank you for choosing <span className="font-semibold text-platina dark:text-platina-light">{serviceName}</span> for your investment journey!
            </p>
         </div>
      </div>
   )
}


// export const PlatinaDisplayRationale=({})=>{
//    return(

//    )
// }