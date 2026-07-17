/**
 * features/discover/store/discoverSlice.ts
 *
 * ⚠️ REFERENCE RECONSTRUCTION — merge with your real file.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type DiscoverState = {
  searchQuery: string;
  inStockOnly: boolean;
};

const initialState: DiscoverState = {
  searchQuery: '',
  inStockOnly: false,
};

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setInStockOnly(state, action: PayloadAction<boolean>) {
      state.inStockOnly = action.payload;
    },
  },
});

export const { setSearchQuery, setInStockOnly } = discoverSlice.actions;
export default discoverSlice.reducer;
