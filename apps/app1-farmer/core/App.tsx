import React from 'react';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../src/store';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { configureNotifications } from '../src/utils/permissions';
import { Font } from '../theme';

// Configure push notification handler at startup
configureNotifications();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
    },
  },
});

const AppText = Text as typeof Text & { defaultProps?: { style?: unknown } };
const AppTextInput = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };

AppText.defaultProps = AppText.defaultProps ?? {};
AppText.defaultProps.style = [AppText.defaultProps.style, { fontFamily: Font.family }];
AppTextInput.defaultProps = AppTextInput.defaultProps ?? {};
AppTextInput.defaultProps.style = [AppTextInput.defaultProps.style, { fontFamily: Font.family }];

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
