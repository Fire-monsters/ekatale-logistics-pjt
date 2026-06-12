import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@ekatale/types';
import { get, patch } from '@services/api/client';
import { API_ROUTES } from '@constants/index';

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  return await get<Notification[]>(API_ROUTES.NOTIFICATIONS);
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id: string) => {
  await patch(API_ROUTES.NOTIFICATION_MARK_READ(id));
  return id;
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
export const selectUnreadCount = (state: { notifications: NotificationState }) =>
  state.notifications.unreadCount;
export const selectNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.items;