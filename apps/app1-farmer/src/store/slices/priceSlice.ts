import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PriceGuidance } from '@ekatale/types';
import { get } from '@services/api/client';
import { API_ROUTES, BUSINESS_RULES } from '@constants/index';

interface PriceState {
  prices: Record<string, PriceGuidance>; // key: `${commodityId}-${regionId}`
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: PriceState = {
  prices: {},
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchPrices = createAsyncThunk(
  'prices/fetch',
  async (
    { commodityIds, regionId }: { commodityIds?: string[]; regionId?: string },
    { getState, rejectWithValue },
  ) => {
    // Cache guard — don't refetch if data is fresh
    const state = (getState() as { prices: PriceState }).prices;
    if (state.lastFetchedAt) {
      const age = Date.now() - new Date(state.lastFetchedAt).getTime();
      if (age < BUSINESS_RULES.PRICE_REFRESH_INTERVAL_MS) {
        return null; // return null to skip update
      }
    }
    try {
      const params = new URLSearchParams();
      if (commodityIds) params.set('commodities', commodityIds.join(','));
      if (regionId) params.set('region', regionId);
      return await get<PriceGuidance[]>(`${API_ROUTES.PRICE_CHECK}?${params}`);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load prices');
    }
  },
);

const priceSlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.prices = {};
          action.payload.forEach((p) => {
            state.prices[`${p.commodityId}-${p.regionId}`] = p;
          });
          state.lastFetchedAt = new Date().toISOString();
        }
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = priceSlice.actions;
export default priceSlice.reducer;

export const selectAllPrices = (state: { prices: PriceState }) =>
  Object.values(state.prices.prices);
export const selectPriceForCommodity =
  (commodityId: string, regionId: string) => (state: { prices: PriceState }) =>
    state.prices.prices[`${commodityId}-${regionId}`];
