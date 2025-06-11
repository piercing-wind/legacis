import { Agreement, User, VerificationType } from "@/prisma/generated/client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { findUserById } from "../data/user";
import { set } from "zod";
import { SerializableAgreement, ServiceAgreement } from "@/types/global";

type SerializableUser = Omit<User, 'createdAt' | 'updatedAt' | 'emailVerified' | 'phoneVerified' | 'panVerified'> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  phoneVerified: string | null;
  panVerified: string | null;

};

export const getFullUserData = createAsyncThunk<SerializableUser | null, string>('profile/getFullUserData', async (userId, { rejectWithValue }) => {
  try{
     const user = await findUserById(userId);

     return user ? {
         ...user,
         createdAt: user.createdAt.toString(),
         updatedAt: user.updatedAt.toString(),
         emailVerified: user.emailVerified ? user.emailVerified.toString() : null,
         phoneVerified: user.phoneVerified ? user.phoneVerified.toString() : null,
         panVerified: user.panVerified ? user.panVerified.toString() : null,
       } : null;
  }catch(error){
      return rejectWithValue((error as Error).message);
   }
})

type ProfileState = {
   modalOpen : boolean;
   modalType : 'emailVerification' | 'emailUpdate' | 'phoneVerification' | 'phoneUpdate' | 'consent' | 'avatar' | 'otpVerification' | 'panVerification' | 'agreement' | null;
   fullUserData : SerializableUser | null;
   status : 'pending' | 'fulfilled' | 'rejected';
   error : string | null;
   identifier : string | null;
   verificationType: VerificationType;  // Only because for Resend OTP
   agreement: SerializableAgreement[] | null;
   agreementData : ServiceAgreement | null;
}


const initialState : ProfileState = {
   modalOpen : false,
   modalType : 'avatar', 
   fullUserData : null,
   status : 'pending',
   error : null,
   identifier : null,  // For OTP form to let user know which identifier is being verified
   verificationType: 'RESET_PASS_VERIFY',
   agreement: null, 
   agreementData: null,
}

const profileSlice = createSlice({
   name: "profile",
   initialState,
   reducers: {
      setModalOpen: (state, action: { payload: {
         open: boolean;
         modelType?: ProfileState['modalType']; 
         agreement?: SerializableAgreement[] | null; 
         agreementData?: ServiceAgreement | null;
      } }) => {
         state.modalOpen = action.payload.open;
         state.modalType = action.payload.modelType ?? null;
         state.agreement = action.payload.agreement ?? null;
         state.agreementData = action.payload.agreementData ?? null;
      },
      setIdentifier: (state, action: { payload: string | null }) => {
         state.identifier = action.payload;
      },
      setVerificationType: (state, action: { payload: ProfileState['verificationType'] }) => {
         state.verificationType = action.payload;
      },
      resetProfileSlice: () => initialState,
   },
 extraReducers: (builder) => {
    builder
      .addCase(getFullUserData.fulfilled, (state, action) => {
        state.fullUserData = action.payload;
        state.error = null;
        state.status = 'fulfilled';
      })
      .addCase(getFullUserData.pending, (state, action)=>{
         state.status = 'pending';
         state.error = null;
         state.fullUserData = null;
      })
      .addCase(getFullUserData.rejected, (state, action) => {
        state.error = action.payload as string;
        state.fullUserData = null;
        state.status = 'rejected';
      });
    }
})


export const { setModalOpen, resetProfileSlice, setIdentifier, setVerificationType } = profileSlice.actions;
export default profileSlice.reducer;