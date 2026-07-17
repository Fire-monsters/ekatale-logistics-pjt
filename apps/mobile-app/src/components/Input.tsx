import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputWrap,
          isFocused && styles.inputWrapFocused,
          !!error && styles.inputWrapError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
          placeholderTextColor="#BDBDBD"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
            disabled={!onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 2,
  },
  required: {
    color: '#C62828',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  inputWrapFocused: {
    borderColor: '#1E5631',
    backgroundColor: '#FAFFFE',
  },
  inputWrapError: {
    borderColor: '#C62828',
    backgroundColor: '#FFF8F8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWithLeft: {
    paddingLeft: 6,
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
  },
  error: {
    fontSize: 12,
    color: '#C62828',
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});