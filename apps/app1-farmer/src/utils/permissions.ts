import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

/** Request camera permission with user-friendly prompt */
export async function requestCameraPermission(): Promise<PermissionResult> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') {
    Alert.alert(
      'Camera Required',
      'E-Katale needs camera access to capture crop photos for AI quality assessment. Please enable it in Settings.',
      [{ text: 'OK' }],
    );
    return 'denied';
  }
  return 'unavailable';
}

/** Request photo library permission */
export async function requestGalleryPermission(): Promise<PermissionResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

/** Request location permission for GPS farm tagging */
export async function requestLocationPermission(): Promise<PermissionResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  Alert.alert(
    'Location Required',
    'E-Katale uses your location to tag your farm and improve delivery routing.',
    [{ text: 'OK' }],
  );
  return 'denied';
}

/** Request push notification permission */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

/** Get current GPS location */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  const perm = await requestLocationPermission();
  if (perm !== 'granted') return null;
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return null;
  }
}

/** Configure notification handler for foreground notifications */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
