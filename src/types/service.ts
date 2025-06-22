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
  main: number;
  date: string;
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


export type PlatinaStockList = {
  stockName: string;
  stockTicker: string;
  sector :string;
  portfolioWeight: number;
  totalShares: number;
  currentSharePrice: number;
  purchaseAmount: number;
  marketValue: number;
  PEratio: number; // Price to Earnings ratio
  marketCapInCrore: number; // Market Capitalization
  entryDate: string;
  exitDate?: string;       
  
  recordDate: string;        // When this record was created
  isActive: boolean;         // Current active record vs historical
  changeType?: "ADDED" | "UPDATED" | "REMOVED" | "INITIAL";
};