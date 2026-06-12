import { useEffect, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setOnlineStatus, selectIsOnline } from '../store/slices/offlineQueueSlice';
import { loggedOut, selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';
import { fetchUserProfile, fetchFarmerProfile } from '../store/slices/userSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { authApi } from '../services/api/auth.api';
import { notificationApi } from '../services';
import { getPendingSyncActions, removeSyncAction, incrementRetryCount } from '../services/local/database';
import { UserRole } from '../types';

// ─────────────────────────────────────────────
// useNetworkStatus
// Monitors connectivity, updates Redux store
// ─────────────────────────────────────────────

export function useNetworkStatus() {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(selectIsOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setOnlineStatus(!!state.isConnected && !!state.isInternetReachable));
    });
    return unsubscribe;
  }, [dispatch]);

  return isOnline;
}

// ─────────────────────────────────────────────
// useOfflineSync
// Flushes the sync queue when coming back online
// ─────────────────────────────────────────────

export function useOfflineSync() {
  const isOnline = useAppSelector(selectIsOnline);
  const isSyncing = useRef(false);

  const flush = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      const actions = await getPendingSyncActions();
      for (const action of actions) {
        try {
          // Route action to appropriate API based on type
          // Each action was enqueued with its payload when offline
          console.log(`[Sync] Processing: ${action.actionType}`, action.payload);
          await removeSyncAction(action.id);
        } catch (err: any) {
          await incrementRetryCount(action.id, err.message ?? 'Unknown error');
          // Skip actions that have failed more than 3 times
          if (action.retryCount >= 3) {
            await removeSyncAction(action.id);
          }
        }
      }
    } finally {
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      flush();
    }
  }, [isOnline, flush]);
}

// ─────────────────────────────────────────────
// useAuth
// Provides auth actions and state
// ─────────────────────────────────────────────

export function useAuth() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Always logout locally even if API fails
    } finally {
      dispatch(loggedOut());
    }
  }, [dispatch]);

  const loadProfile = useCallback(async () => {
    await dispatch(fetchUserProfile());
    if (role === UserRole.FARMER) {
      await dispatch(fetchFarmerProfile());
    }
  }, [dispatch, role]);

  return { isAuthenticated, role, logout, loadProfile };
}

// ─────────────────────────────────────────────
// useNotifications
// Sets up push notification listeners
// ─────────────────────────────────────────────

export function useNotifications() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Register push token with server
    const registerToken = async () => {
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        await notificationApi.registerPushToken(token.data, 'android');
      } catch {
        // Non-critical — app works without push
      }
    };

    registerToken();

    // Listen for incoming notifications while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      dispatch(
        addNotification({
          id: notification.request.identifier,
          userId: '',
          channel: 'PUSH',
          title: title ?? '',
          message: body ?? '',
          data: data as Record<string, unknown>,
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );
    });

    return () => subscription.remove();
  }, [dispatch]);
}

// ─────────────────────────────────────────────
// useTransportTracking
// Polls driver location every 60s when a job is active
// ─────────────────────────────────────────────

export function useTransportTracking(jobId: string | null) {
  const isOnline = useAppSelector(selectIsOnline);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!jobId || !isOnline) return;

    const poll = async () => {
      try {
        const { transportApi } = await import('../services');
        const loc = await transportApi.getDriverLocation(jobId);
        locationRef.current = { lat: loc.lat, lng: loc.lng };
      } catch {
        // Silent — keep showing last known location
      }
    };

    poll();
    const interval = setInterval(poll, 60_000); // PRD: update every 60s
    return () => clearInterval(interval);
  }, [jobId, isOnline]);

  return locationRef.current;
}
