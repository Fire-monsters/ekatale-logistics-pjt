// apps/app1-farmer/src/utils/uuid.ts

/**
 * Generates a UUID v4. Used for offlineId on listings created while offline —
 * doesn't need cryptographic randomness, just uniqueness, so we avoid
 * depending on react-native-get-random-values / expo-crypto.
 */
export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}