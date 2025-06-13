import { Agreement, Coupon } from "@/prisma/generated/client";
import { SerializableAgreement, SerializableCoupon, ServiceAgreement } from "@/types/global";
import { TenureDiscount } from "@/types/service";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
   service : {
      serviceId : string;
      tenureDiscount : TenureDiscount
   },
   agreement : SerializableAgreement[] | null;
   agreementSummary : ServiceAgreement | null;
   coupon: SerializableCoupon | null;
}

const initialState: CheckoutState = {
   service: {
      serviceId: "",
      tenureDiscount: {
         days: 0,
         discount: 0,
      },
   },

   agreementSummary: null,
   agreement: null,
   coupon: null,
}

const checkoutSlice = createSlice({
   name: "checkout",
   initialState,
   reducers: {
      selectTenure: (state, action: PayloadAction<TenureDiscount & { serviceId?: string }>) => {
         state.service.tenureDiscount = action.payload;
         state.service.serviceId = action.payload.serviceId || "";
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

export const {selectTenure, setAgreementSummary, setAgreement, setCoupon} = checkoutSlice.actions;
export default checkoutSlice.reducer;