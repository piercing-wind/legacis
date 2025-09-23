import { Cashfree, CFEnvironment } from "cashfree-pg";

export let cashfree: Cashfree;
if (process.env.NODE_ENV === "production") {
  cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    process.env.CASHFREE_PAYMENT_GATEWAY_LIVE_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_LIVE_SECRET!
  );
} else {
  cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_PAYMENT_GATEWAY_TEST_CLIENT_ID!,
    process.env.CASHFREE_PAYMENT_GATEWAY_TEST_SECRET!
  );
}
