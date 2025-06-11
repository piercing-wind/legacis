import { Cashfree, CFEnvironment } from "cashfree-pg";

export let cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_PAYMENT_GATEWAY_TEST_CLIENT_ID!,
  process.env.CASHFREE_PAYMENT_GATEWAY_TEST_SECRET!
);