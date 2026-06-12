module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-native-async-storage|@react-navigation|react-redux|@reduxjs|redux|redux-thunk|reselect|immer|expo(nent)?|@expo(nent)?/.*|@expo/.*|expo-.*)/)',
  ],
};
