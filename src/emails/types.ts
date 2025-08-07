export type OtpMailContext = {
  name: string;
  otp: string;
  year: number;
};

export type UpdateMailContext = {
  name: string;
  serviceName: string;
  dashboardUrl: string;
  title: string;
  year: number;
};

export type SubscriptionMailContext = {
  name: string;
  year: number;
  title: string;
  // add more fields as needed
};

export type SuccessPurchaseMailContext = {
  customerName: string;
  serviceName: string;
  planDuration: string;
  orderId: string;
  paymentId: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  purchaseDate: string;
  expiryDate?: string | null; // Optional, can be added if needed
  profileUrl: string;
  dashboardUrl: string;
  year: string;
};


export type MailType = 'otp' | 'update' | 'subscription' | 'successPurchase';