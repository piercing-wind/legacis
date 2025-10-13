import { Cashfree, CFEnvironment } from "cashfree-pg";

export let ra_cashfree: Cashfree;
if (process.env.NODE_ENV === "production") {
  ra_cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    process.env.CASHFREE_PAYMENT_GATEWAY_RA_LIVE_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_RA_LIVE_SECRET!
  );
} else {
  ra_cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_PAYMENT_GATEWAY_RA_TEST_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_RA_TEST_SECRET!
  );
}
export let ia_cashfree: Cashfree;
if (process.env.NODE_ENV === "production") {
  ia_cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    process.env.CASHFREE_PAYMENT_GATEWAY_IA_LIVE_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_IA_LIVE_SECRET!
  );
} else {
  ia_cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_PAYMENT_GATEWAY_IA_TEST_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_IA_TEST_SECRET!
  );
}
