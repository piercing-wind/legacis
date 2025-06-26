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
import { UserPlatinaStockHistory, UserPlatinaStockList } from "@/prisma/generated/client";
// import STYLE from '@/app/(user-routes)/platina-wealth/platina.module.css'
import PlatinaPieChart from "./platinaPieChart";
import PlatinaSimpleLineChart from "./platinaLineChart";
import { Line } from "../icon";
import { PDFDisplay } from "../pdfDisplay";
import { QuillHtmlViewer } from "../richTextViewer";
import PlatinaStockTimeline from "./platinaStockTimeline";


function generateSectorColor(sectorName: string, index: number): string {
  const baseColors = [
    "#4AEDB9", // legacisGreen
    "#6104C0", // legacisPurple
    "#8036F2", // legacisBlue
    "#FA2EF3", // legacisPink
    "#E2FFE9", // legacisLightGreen
    "#F1FFFA", // legacisLight
    // Additional colors that complement your palette
    "#9D4EDD", // Purple variant
    "#06FFA5", // Green variant
    "#C77DFF", // Light purple
    "#4CC9F0"  // Light blue
  ];
  
  if (index < baseColors.length) {
    return baseColors[index];
  }
  
  // For additional colors beyond the base palette, generate from your primary colors
  const primaryColors = ["#4AEDB9", "#6104C0", "#8036F2", "#FA2EF3"];
  const baseColor = primaryColors[index % primaryColors.length];
  
  // Generate variations of your primary colors
  const variations = [
    adjustColorBrightness(baseColor, 20),   // Lighter
    adjustColorBrightness(baseColor, -15),  // Darker
    adjustColorBrightness(baseColor, 40),   // Much lighter
    adjustColorBrightness(baseColor, -30)   // Much darker
  ];
  
  return variations[(index - baseColors.length) % variations.length];
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function getMarketCapCategory(marketCapInCrore: number): string {
   if (marketCapInCrore >= 20000) {
    return 'Large Cap';
  } else if (marketCapInCrore >= 10000) {
    return 'Mid Cap';
  } else if (marketCapInCrore >= 2000) {
    return 'Small Cap';
  } else {
    return 'Micro Cap';
  }
}


export const PlatinaServiceCard = ({userRecommendation}:{userRecommendation: UserPlatinaRecommendationWithDetails}) => {
   const {riskProfile, platinaService, stocks, stockHistory, notes, recommendationDate, userInvestmentAmount, peChart, epsChart, rationale} = userRecommendation || {};
   // const stockList = stockRecommendations as PlatinaStockList[];
   const activeTickers = (stocks || []).filter(s => s.isActive).map(s => s.stockTicker);

   // Filter history to only include events for active stocks
   const filteredStockHistory = (stockHistory || []).filter(
      h => activeTickers.includes(h.stockTicker)
   );  

   const totalInvestmentAmount = stocks?.reduce((total, stock) => {
    return total + (stock.purchaseAmount || 0);
  }, 0);

   return (
      <> 
         <PlatinaPortfolioUpdates recomendationDate={recommendationDate|| null} userInvestmentAmount={totalInvestmentAmount || 0} rationale={rationale}/>
         <PlatinaStockListTable stockList ={stocks || []} notes={notes || ''}/>
         <PlatinaStockTimeline stockHistory={stockHistory || []} />
         <PlatinaPieCharts stockList={stocks || []}/>
         <PlatinaLineCharts peChart={peChart} epsChart={epsChart}/>
      </>
   )
}



const PlatinaPortfolioUpdates =({recomendationDate, userInvestmentAmount, rationale}:{recomendationDate : Date | null, userInvestmentAmount : number | null, rationale: any })=> {
   return (
      <div className="w-full border border-platina/70 rounded-2xl p-4 flex flex-col mb-8">
         <div className="flex flex-row items-center justify-between gap-2">
            <p className="text-sm">Next Review Date: <span className="text-base">{formatHumanDate(recomendationDate!)}</span></p>
            <p className="text-sm">Investment Amount: <span className="font-urbanist font-semibold text-lg">₹{userInvestmentAmount?.toLocaleString()}</span></p>
            <Dialog>
              <DialogTrigger className="text-sm text-white rounded bg-platina/80 hover:bg-platina duration-300 transition-all px-4 py-2 cursor-pointer">View Rationale</DialogTrigger>
              <DialogContent className="max-h-[80vh] w-[calc(100%-14px)] max-w-3xl h-full overflow-y-auto overflow-x-hidden p-4">
                  <DialogTitle>&nbsp;</DialogTitle>
                  <QuillHtmlViewer delta={rationale} className="text-sm" />
              </DialogContent>
            </Dialog>
         </div>
      </div>
   )
}


const PlatinaStockListTable = ({stockList, notes = ''}:{stockList: UserPlatinaStockList[], notes: string}) => {
  return(
      <div className={`w-full border border-platina/70 rounded-2xl p-4 flex flex-col mb-8`}>
          <h6 className="mb-4"> Current Portfolio Recommendations </h6>
          <Table containerClass={''} className="">
            <TableCaption className="mb-4">
               <p className="text-xs">Notes: {notes || "No additional notes"}</p>
            </TableCaption>
            <TableHeader>
               <TableRow className="text-sm">
                 <TableHead>#</TableHead>
                 <TableHead className="w-[100px]">Company Name</TableHead>
                 <TableHead>Stock Ticker</TableHead>
                 <TableHead>Portfolio Weight</TableHead>
                 <TableHead>Total Shares</TableHead>
                 <TableHead>Current Share Price</TableHead>
                 <TableHead>Purchase Amount</TableHead>
                 <TableHead>PE Ratio</TableHead>
                 <TableHead>Market Cap (in cr.)</TableHead>
                 <TableHead>Sector</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
          {stockList.map((stock, index) => (
            <TableRow key={index} className="text-xs">
               <TableCell className="text-center">{index + 1}</TableCell>
               <TableCell className="font-medium">{stock.stockName}</TableCell>
               <TableCell>{stock.stockTicker}</TableCell>
               <TableCell>{stock.portfolioWeight}%</TableCell>
               <TableCell>{stock.totalShares}</TableCell>
               <TableCell className="font-urbanist">₹{stock.currentSharePrice.toFixed(2)}</TableCell>
               <TableCell className="font-urbanist">₹{stock.purchaseAmount.toFixed(2)}</TableCell>
               <TableCell>{stock.PEratio}</TableCell>
               <TableCell className="font-urbanist">₹{stock.marketCapInCrore} Cr</TableCell>
               <TableCell>{stock.sector}</TableCell>
            </TableRow>
          ))}

         </TableBody>
       </Table>
      </div>
   )
};


const PlatinaPieCharts =({stockList}:{stockList: UserPlatinaStockList[]})=> {
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
        'Large Cap': '#4AEDB9',    // legacisGreen
        'Mid Cap': '#6104C0',      // legacisPurple
        'Small Cap': '#8036F2',    // legacisBlue
        'Micro Cap': '#FA2EF3'     // legacisPink
      }
   );

  const chartConfig = {
    sectors: { label: "Allocation" },
  }


   return(
      <div className="w-full flex flex-col lg:flex-row gap-8 rounded-2xl mb-8">
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
};

const PlatinaLineCharts=({peChart, epsChart}:{peChart : any, epsChart: any})=>{
   const chartConfig = {
      value:{
         label: "Performance",
         color: "#4AEDB9",
      }
   }

   return (
      <div className="w-full flex flex-col lg:flex-row gap-8 rounded-2xl mb-8">
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
};

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
};


// export const PlatinaDisplayRationale=({})=>{
//    return(

//    )
// }