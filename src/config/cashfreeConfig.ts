'use server';
import { Cashfree as CashfreeSDK } from "cashfree-verification";

let isInitialized = false;

function getCashfree() {
  if (!isInitialized) {
    CashfreeSDK.XClientId = process.env.CASHFREE_SECURE_ID_CLIENT_ID!;
    CashfreeSDK.XClientSecret = process.env.CASHFREE_SECURE_ID_SECRET_KEY!;
    CashfreeSDK.XEnvironment = process.env.NODE_ENV === 'production'
      ? CashfreeSDK.Environment.PRODUCTION
      : CashfreeSDK.Environment.PRODUCTION;
    isInitialized = true;
  }
  return CashfreeSDK;
}

export { getCashfree };