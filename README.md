This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Complimentary Services

The ComplimentaryService Model is designed to store all the relationships between services and their complimentary services. It is acting as a junction table between the Service and ComplimentaryService models.

## Complex System Architecture & Implementation Details

### 🔧 Service Management System

to get service Agreement of purchased by the user use transactionAgreements relation in Transaction model.

#### Service Types & Their Unique Behaviors
```typescript
enum ServiceType {
  RESEARCH_ADVISORY_MUTUAL_FUNDS,  // Has mutual fund page content
  PORTFOLIO_REVIEW,                // Has stock limits per plan
  PLATINA_WEALTH,                  // Has Platina wealth page, special recommendation system for each user

  // ... other types have common recommendation system for all users
}
```

**Key Implementation Details:**
- **PORTFOLIO_REVIEW**: Plans include `stockLimit` field for portfolio size restrictions
- **RESEARCH_ADVISORY_MUTUAL_FUNDS**: Has rich text content (`detailMutualFundPageDelta`)
- All services except PORTFOLIO_REVIEW have `afterPurchaseFeaturesDelta` content

#### Service Plans & Discount Logic
```typescript
interface ServicePlan {
  discount?: number;  // Fraction (0.1 = 10% off), NOT percentage
  stockLimit?: number; // Only for PORTFOLIO_REVIEW
}
```

**Critical Business Rules:**
- Discount is stored as fraction (0.1 for 10%), never as percentage
- Empty discount field = `undefined`, NOT `0` (prevents display issues)
- When discount is 0, treat as no discount (don't show discount badges)

### 💳 Payment & Checkout Flow

#### Redux State Management
```typescript
// Checkout slice stores serializable data only
interface CheckoutState {
  service: {
    selectedPlan: SerializablePlan;
  };
  coupon: SerializableCoupon | null;  // No nested relations
  agreement: SerializableAgreement[];
}
```

**Critical Implementation:**
- All Redux data must be serializable (no Date objects, no nested Prisma relations)
- Dates are stored as ISO strings and converted when needed
- Coupon objects exclude `service` and `servicePlan` relations to prevent serialization errors

#### Price Calculation Logic
```typescript
const subtotal = Math.round(basePrice * (1 - (planDiscount || 0)));
const couponDiscount = appliedCoupon ? Math.round(subtotal * appliedCoupon.percentOff) : 0;
const taxableAmount = subtotal - couponDiscount;
const taxAmount = Math.round(taxableAmount * (taxPercent / 100));
const total = taxableAmount + taxAmount;
```

### 🎟️ Coupon System

#### Coupon Types & Validation
```typescript
// Coupon applicability hierarchy (OR conditions):
1. Global: serviceId = null, servicePlanId = null
2. Service-wide: serviceId = X, servicePlanId = null  
3. Plan-specific: servicePlanId = X (service derived from plan)
4. Exact match: serviceId = X, servicePlanId = Y
```

**Database Constraints:**
  This is for the Shadcn Ui Select component.
- When servicePlanId = "none" in form → convert to `null` in database
- Foreign key constraints require valid IDs or `null`, not strings like "none"

#### Coupon Data Serialization
```typescript
// ❌ Wrong - includes non-serializable nested objects
const coupon = await db.coupon.findFirst({ include: { service: true } });

// ✅ Correct - only essential fields
const coupon = await db.coupon.findFirst({
  select: {
    id: true, code: true, percentOff: true, // ... other scalars
    // Don't include service or servicePlan relations
  }
});
```

### 📄 Agreement System

#### Agreement Versioning & Linking
- Services can have multiple agreements attached
- Each agreement has version control and timestamps
- Users must accept all linked agreements before purchase
- Agreement data is serialized for Redux (Date → ISO string)
- Agreement Hashes are stored in DB, as well as Agreement Summary


### 🎯 Risk Profiling (Platina Wealth)

#### Risk Assessment Flow
```typescript
interface RiskProfile {
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'VERY_AGGRESSIVE';
  riskPercentage: number;
  totalScore: number;
}
```

**Implementation Notes:**
- Risk profiles determine portfolio allocation
- Recommendations are generated based on risk tolerance
- Investment amounts are calculated from actual stock purchases, not user input

### 🛠️ Data Fetching Patterns

#### Avoiding N+1 Queries
```typescript
// ✅ Good - Single query with includes
const services = await db.service.findMany({
  include: {
    plans: true,
    agreements: { include: { agreement: true } },
    complimentaryService: true,
  }
});

// ❌ Bad - Multiple queries in loop
const services = await db.service.findMany();
for (const service of services) {
  const plans = await db.servicePlan.findMany({ where: { serviceId: service.id } });
}
```

#### Type Safety with Prisma Relations
```typescript
// Define types for included relations
type ServiceWithPlans = Service & {
  plans: ServicePlan[];
  agreements: (ServiceAgreement & { agreement: Agreement })[];
};
```

### 🔐 Authentication & Authorization

#### KYC Verification Flow
```typescript
// Required verification order:
1. PAN Verification (panVerified)
2. Email Verification (emailVerified)  
3. Phone Verification (phoneVerified)
```

**Critical Rules:**
- All verifications must be completed before purchase
- PAN verification is permanent (cannot be changed after completion)
- Verification modals are managed through Redux state

### 📊 Admin Dashboard Patterns

#### Subscription Management
```typescript
// Handle nullable expiry dates
const currentExpiry = subscription.expiryDate ?? new Date();
const newExpiry = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000));
```

#### Grant Access System
- Admins can manually grant service access
- Bypass payment flow for promotional/support purposes
- Uses same plan structure as regular purchases

### 🚫 Common Pitfalls & Solutions

#### 1. Redux Serialization Errors
**Problem:** Storing Date objects or Prisma relations in Redux
**Solution:** Convert dates to ISO strings, exclude nested relations

#### 2. Discount Display Issues
**Problem:** Treating 0 discount as falsy, causing display problems
**Solution:** Use `discount != null && discount > 0` checks

#### 3. Foreign Key Constraint Errors
**Problem:** Sending string "none" instead of null for optional foreign keys
**Solution:** Convert special strings to undefined/null before database operations

#### 4. Type Mismatches with Nullable Fields
**Problem:** TypeScript errors when fields can be null but types expect non-null
**Solution:** Use nullish coalescing (`??`) and proper type guards

### 🧪 Testing Considerations

#### Key Areas to Test
1. **Price Calculations**: Ensure rounding consistency across discount/tax calculations
2. **Coupon Validation**: Test all coupon type combinations and edge cases
3. **Serialization**: Verify Redux state doesn't contain non-serializable data
4. **Type Conversions**: Test null/undefined handling in form submissions
5. **Service Type Logic**: Verify behavior differences between service types

### 📋 Maintenance Checklist

#### Before Adding New Features
- [ ] Check if service type needs special handling
- [ ] Ensure all form data is properly typed and validated
- [ ] Verify Redux state remains serializable
- [ ] Test discount and pricing calculations
- [ ] Validate foreign key relationships

#### When Modifying Existing Features
- [ ] Update related TypeScript interfaces
- [ ] Check impact on price calculation logic
- [ ] Verify coupon system compatibility
- [ ] Test across all service types
- [ ] Update admin interfaces if needed

---

## Complimentary Services

The ComplimentaryService Model is designed to store all the relationships between services and their complimentary services. It is acting as a junction table between the Service and ComplimentaryService models.