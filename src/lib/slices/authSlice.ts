import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "next-auth";
import { Session } from "@/actions/session";


interface AuthState {
  model: "register" | "login" | "forgot-password" | "otp" | "reset-password";
  escPressed: boolean;
  isAuthOpen: boolean;
  user: User | null;
  isLoggedIn: boolean;
  history: string[];
   status: "pending" | "fulfilled" | "rejected";
}


const initialState : AuthState = {
   model : "register",
   escPressed: false,
   isAuthOpen: false,
   user : null,
   isLoggedIn: false,
   history: [] as string[],
   status: 'pending',
}

export const getSession = createAsyncThunk<User | null>("auth/getSession", async () => {
   const session = await Session();
   return session?.user || null;
})

const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {
      setAuthModel: (state, action : PayloadAction<"register" | "login" | "forgot-password" | "otp" | "reset-password" | "reset-password">) => {
         state.history.push(state.model);
         state.model = action.payload;
      },
      goBack: (state) => {
        const previousModel = state.history.pop();
        if (previousModel) {
          state.model = previousModel as AuthState["model"];
        }
      },
      setEscPressed: (state, action) => {
         state.escPressed = action.payload;
      },
      setAuthOpen: (state, action) => {
         state.isAuthOpen = action.payload;
      },
      resetAuthSlice: ()=> initialState,
   },
   extraReducers: (builder)=>{
      builder
         .addCase(getSession.fulfilled, (state, action) => {
            state.status = "fulfilled";
            state.isLoggedIn = !!action.payload;
            state.user = action.payload;
         })
         .addCase(getSession.rejected, (state) => {
            state.status = "rejected";
            state.isLoggedIn = false;
            state.user = null;
         })
         .addCase(getSession.pending, (state) => {
            state.status = "pending";
            state.isLoggedIn = false;
            state.user = null;
         });
   }
});

export const {setAuthModel, setAuthOpen, resetAuthSlice, goBack, setEscPressed} = authSlice.actions;
export default authSlice.reducer;