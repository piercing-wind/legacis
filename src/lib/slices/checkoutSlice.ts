import { TenureDiscount } from "@/types/service";
import { createSlice } from "@reduxjs/toolkit";

interface CheckoutState {
   tenureDiscount : TenureDiscount,
}

const initialState: CheckoutState = {
   tenureDiscount: {
      days: 0,
      discount: 0,
   }
}

const checkoutSlice = createSlice({
   name: "checkout",
   initialState,
   reducers: {
      setTenureDiscount: (state, action) => {
         state.tenureDiscount = action.payload;
      },
   },
});

export const {setTenureDiscount} = checkoutSlice.actions;
export default checkoutSlice.reducer;