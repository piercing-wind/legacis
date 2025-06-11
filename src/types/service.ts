export type ServiceFeature = {
  highlights: {
    name: string;
    value: string;
  }[];
}


export type TenureDiscount = {
  days: number;
  discount: number;
};

export type ChartDataPoint = {
  week: string;
  month: string;
  main: number;
  comparison: number;
};

export type FaqItem = {
  q: string;
  a: string;
};


export type StockList = {
  name: string;
  symbol: string;
  status: "OPEN" | "CLOSED";
  entryDate: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  rationale: string;
  exitDate?: string;       
  exitRationale?: string;
  side?: "BUY" | "SELL";
};