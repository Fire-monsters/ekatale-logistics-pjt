import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';
import offlineQueueReducer from './slices/offlineQueueSlice';
import authReducer from './slices/authSlice';
import listingReducer from './slices/listingSlice';
import priceReducer from './slices/priceSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    notifications: notificationReducer,
    offlineQueue: offlineQueueReducer,
    listings: listingReducer,
    prices: priceReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
