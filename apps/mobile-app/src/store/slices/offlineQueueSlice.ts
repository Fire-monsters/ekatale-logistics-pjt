import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
  retries: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  isSyncing: boolean;
  isOnline: boolean;
}

const initialState: OfflineQueueState = {
  queue: [],
  isSyncing: false,
  isOnline: true,
};

const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    enqueue(state, action: PayloadAction<Omit<QueuedAction, 'retries'>>) {
      state.queue.push({ ...action.payload, retries: 0 });
    },
    dequeue(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter(i => i.id !== action.payload);
    },
    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.queue.find(i => i.id === action.payload);
      if (item) item.retries += 1;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    clearQueue(state) {
      state.queue = [];
    },
  },
});

export const { enqueue, dequeue, incrementRetry, setSyncing, setOnlineStatus, clearQueue } =
  offlineQueueSlice.actions;
export default offlineQueueSlice.reducer;

export const selectIsOnline = (state: { offlineQueue: OfflineQueueState }) =>
  state.offlineQueue.isOnline;

export {};
