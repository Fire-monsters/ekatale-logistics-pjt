import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  message?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  channel?: string;
  userId?: string;
  data?: Record<string, unknown>;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead(state) {
      state.items.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find(i => i.id === action.payload);
      if (n && !n.read) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
});

export const { addNotification, markAllRead, markRead } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationState }) =>
  state.notifications.unreadCount;
