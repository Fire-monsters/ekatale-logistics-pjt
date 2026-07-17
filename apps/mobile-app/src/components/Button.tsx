import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#2E7D32'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}`],
              styles[`labelSize_${size}`],
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // WCAG 2.1 AA touch target
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: '#1E5631',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1E5631',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: '#C62828',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  disabled: {
    opacity: 0.45,
  },
  // Sizes
  size_sm: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  size_md: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: 10 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12 },
  // Labels
  label: {
    fontWeight: '600',
  },
  label_primary: { color: '#FFFFFF' },
  label_secondary: { color: '#1E5631' },
  label_ghost: { color: '#1E5631' },
  label_destructive: { color: '#FFFFFF' },
  label_outline: { color: '#424242' },
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 16 },
  // Icon spacing
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});