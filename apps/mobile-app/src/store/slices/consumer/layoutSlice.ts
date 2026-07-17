/**
 * features/discover/store/layoutSlice.ts
 *
 * Minimal local-only slice holding fields that belong to a future
 * cart/notifications feature. TODO: move cartItemCount to its own cart
 * feature and hasUnreadNotifications to its own notifications feature once
 * those exist — this is a temporary home for Prompt 7's header badges.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type LayoutState = {
  cartItemCount: number;
  hasUnreadNotifications: boolean;
};

const initialState: LayoutState = {
  cartItemCount: 3,
  hasUnreadNotifications: true,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setCartItemCount(state, action: PayloadAction<number>) {
      state.cartItemCount = action.payload;
    },
    setHasUnreadNotifications(state, action: PayloadAction<boolean>) {
      state.hasUnreadNotifications = action.payload;
    },
  },
});

export const { setCartItemCount, setHasUnreadNotifications } = layoutSlice.actions;
export default layoutSlice.reducer;
