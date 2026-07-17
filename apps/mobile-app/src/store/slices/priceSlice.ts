// apps/app1-farmer/src/store/slices/priceSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PriceGuidance, Commodity } from '../../types';
import type { RootState } from '../index';
import { priceApi } from '../../services/api/price.api';
import { saveCachedPrices, getCachedPrices } from '../../db/database';
import { BUSINESS_RULES } from '../../constants';
import { selectIsOnline } from './offlineQueueSlice';

interface PriceState {
  prices: Record<string, PriceGuidance>; // key: `${commodityId}-${regionId}`
  commodities: Commodity[];
  isLoading: boolean;
  isLoadingCommodities: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  fromCache: boolean;
}

const initialState: PriceState = {
  prices: {},
  commodities: [],
  isLoading: false,
  isLoadingCommodities: false,
  error: null,
  lastFetchedAt: null,
  fromCache: false,
};

/**
 * Fetches current price guidance. Online: hits listing-service and caches
 * for offline display. Offline (or on network error): falls back to the
 * last cached prices so PriceCheck still shows useful (if stale) numbers.
 *
 * The 5-minute cache guard avoids redundant fetches when the screen
 * re-mounts shortly after a previous fetch.
 */
export const fetchPrices = createAsyncThunk(
  'prices/fetch',
  async (
    { commodityIds, regionId }: { commodityIds?: string[]; regionId?: string },
    { getState },
  ) => {
    const state = (getState() as RootState).prices;
    const isOnline = selectIsOnline(getState() as RootState);

    if (state.lastFetchedAt && !state.fromCache) {
      const age = Date.now() - new Date(state.lastFetchedAt).getTime();
      if (age < BUSINESS_RULES.PRICE_REFRESH_INTERVAL_MS) {
        return null; // skip — data is fresh
      }
    }

    if (!isOnline) {
      const cached = (await getCachedPrices()) as PriceGuidance[];
      return { prices: cached, fromCache: true };
    }

    try {
      const prices = await priceApi.getPrices({ commodityIds, regionId });
      await saveCachedPrices(prices);
      return { prices, fromCache: false };
    } catch {
      const cached = (await getCachedPrices()) as PriceGuidance[];
      return { prices: cached, fromCache: true };
    }
  },
);

export const fetchCommodities = createAsyncThunk(
  'prices/fetchCommodities',
  async (_, { getState }) => {
    const state = (getState() as RootState).prices;
    if (state.commodities.length > 0) return state.commodities; // cached for app session
    return priceApi.listCommodities();
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
        if (!action.payload) return; // skipped — data still fresh

        state.prices = {};
        action.payload.prices.forEach((p) => {
          state.prices[`${p.commodityId}-${p.regionId}`] = p;
        });
        state.fromCache = action.payload.fromCache;
        if (!action.payload.fromCache) state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load prices';
      })

      .addCase(fetchCommodities.pending, (state) => {
        state.isLoadingCommodities = true;
      })
      .addCase(fetchCommodities.fulfilled, (state, action) => {
        state.isLoadingCommodities = false;
        state.commodities = action.payload;
      })
      .addCase(fetchCommodities.rejected, (state) => {
        state.isLoadingCommodities = false;
      });
  },
});

export const { clearError } = priceSlice.actions;
export default priceSlice.reducer;

export const selectAllPrices = (state: RootState) => Object.values(state.prices.prices);
export const selectPricesFromCache = (state: RootState) => state.prices.fromCache;
export const selectPriceForCommodity =
  (commodityId: string, regionId = 'national') => (state: RootState) =>
    state.prices.prices[`${commodityId}-${regionId}`];
export const selectCommodities = (state: RootState) => state.prices.commodities;
export const selectCommoditiesLoading = (state: RootState) => state.prices.isLoadingCommodities;