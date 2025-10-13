import { ServicePlan, ServiceType } from "@/prisma/generated/client";
import { SerializableAgreement, SerializableCoupon, ServiceAgreement } from "@/types/global";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
  service: {
    serviceId: string | null;
    selectedPlan: ServicePlan | null;
    serviceType: ServiceType | null;
  },
  agreement: SerializableAgreement[] | null;
  agreementSummary: ServiceAgreement | null;
  coupon: SerializableCoupon | null;
}

const initialState: CheckoutState = {
  service: {
    serviceId: null,
    selectedPlan: null,
    serviceType: null,
  },
  agreementSummary: null,
  agreement: null,
  coupon: null,
}

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    selectPlan: (state, action: PayloadAction<ServicePlan & { serviceId?: string | null, serviceType?: ServiceType}>) => {
      const { serviceId, ...planData } = action.payload;
      state.service.selectedPlan = planData as ServicePlan;
      state.service.serviceId = serviceId || null;
      state.service.serviceType = action.payload.serviceType || null;
    },
    setAgreementSummary: (state, action: PayloadAction<ServiceAgreement | null>) => {
      state.agreementSummary = action.payload;
    },
    setAgreement: (state, action: PayloadAction<SerializableAgreement[] | null>) => {
      state.agreement = action.payload;
    },
    setCoupon: (state, action: PayloadAction<SerializableCoupon | null>) => {
      state.coupon = action.payload;
    },
  },
});

export const { selectPlan, setAgreementSummary, setAgreement, setCoupon } = checkoutSlice.actions;
export default checkoutSlice.reducer;