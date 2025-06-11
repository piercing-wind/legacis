import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import { findServicesBySlugs } from '../data/services';
import { Service } from '@/prisma/generated/client';

export type SerializedService = Omit<Service, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const getRecomendedServices = createAsyncThunk<SerializedService[], string[]>('services/getRecomendedServices', async (ServiceSlugList : string[], { rejectWithValue }) => {
   try {
      const response = await findServicesBySlugs(ServiceSlugList)
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
      .addCase(getRecomendedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecomendedServices.fulfilled, (state, action: PayloadAction<SerializedService[]>) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getRecomendedServices.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
   }})

export default serviceSlice.reducer;