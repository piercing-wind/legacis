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

export type MailType = 'otp' | 'update' | 'subscription';