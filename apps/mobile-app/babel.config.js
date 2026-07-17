module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@components': './src/components',
          '@components/common': './src/components/index.ts',
          '@services': './src/services',
          '@constants': './src/constants',
          '@theme': './theme',
          '@utils': './src/utils',
          '@ekatale/types': './src/types/index.ts',
          '@styles': './src/styles',
        },
      },
    ],
  ],
};
