import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import { findServicesByIds } from '../data/services';
import { Service } from '@/prisma/generated/client';

export type SerializedService = Omit<Service, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const getRecommendedServices = createAsyncThunk<SerializedService[], string[]>('services/getRecommendedServices', async (ServiceIdList : string[], { rejectWithValue }) => {
   try {
      const response = await findServicesByIds(ServiceIdList)
      const serialized = response.map(service => ({
        ...service,
        createdAt: service.createdAt instanceof Date ? service.createdAt.toISOString() : service.createdAt,
        updatedAt: service.updatedAt instanceof Date ? service.updatedAt.toISOString() : service.updatedAt,
      }));
      return serialized;
   } catch (error) {
      return rejectWithValue((error as Error).message);
   }
})


const initialState = {
   services: [] as SerializedService[],
   loading: false,
   error: null,
}


const serviceSlice = createSlice({
   name: 'services',
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
      .addCase(getRecommendedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecommendedServices.fulfilled, (state, action: PayloadAction<SerializedService[]>) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getRecommendedServices.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
   }})

export default serviceSlice.reducer;