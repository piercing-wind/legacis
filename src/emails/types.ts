export type OtpMailContext = {
  name: string;
  otp: string;
  year: number;
};

export type UpdateMailContext = {
  name: string;
  year: number;
  title: string;
  // add more fields as needed
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
  planType: string;
  orderId: string;
  transactionId: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  purchaseDate: string;
  profileUrl: string;
  dashboardUrl: string;
  year: string;
};


export type MailType = 'otp' | 'update' | 'subscription' | 'successPurchase';