# Ekatale mobile app

## Development backend host

For Expo development on a physical device, set one of these before starting the app:

- `EXPO_PUBLIC_API_HOST=192.168.1.50`
- `API_HOST=192.168.1.50`

The app will prefer the explicit host override, then fall back to the Expo debugger host if available, and finally use the bundled default host.

Example:

```bash
cd apps/mobile-app
EXPO_PUBLIC_API_HOST=192.168.1.50 npx expo start --lan
```
