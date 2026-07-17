// apps/app1-farmer/src/components/FeedbackDialog.tsx
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { Colors, Font, Space, Layout } from '../theme';

export type DialogVariant = 'success' | 'error' | 'warning' | 'info';

export interface DialogAction {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'destructive';
}

export interface FeedbackDialogProps {
  visible: boolean;
  variant: DialogVariant;
  title: string;
  message?: string;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  onRequestClose?: () => void;
  /** Auto-dismiss after N ms — handy for quick success confirmations */
  autoDismissMs?: number;
}

const VARIANT_CONFIG: Record <
  DialogVariant,
  { Icon: typeof CheckCircle2; color: string; bg: string; border: string }
> = {
  success: {
    Icon: CheckCircle2,
    color: Colors.green,
    bg: Colors.greenLight,
    border: Colors.greenBorder
},
  error:   {
    Icon: XCircle,
    color: Colors.error,
    bg: Colors.errorLight,
    border: '#FFCDD2'
},
  warning: {
    Icon: AlertTriangle,
    color: Colors.warning,
    bg: '#FFF3E0',
    border: '#FFCC80'
},
  info: {
    Icon: Info,
    color: Colors.info,
    bg: '#E3F2FD',
    border: '#90CAF9'
 },
};

export function FeedbackDialog({
  visible,
  variant,
  title,
  message,
  primaryAction,
  secondaryAction,
  onRequestClose,
  autoDismissMs,
}: FeedbackDialogProps) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { Icon, color, bg, border } = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.85);
      opacity.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 9 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    if (autoDismissMs) {
      const t = setTimeout(() => onRequestClose?.(), autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [visible, autoDismissMs, onRequestClose, scale, opacity]);

  const runAndClose = (action?: DialogAction) => {
    action?.onPress?.();
    onRequestClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onRequestClose}>
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={s.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[s.card, { opacity, transform: [{ scale }] }]}
              accessibilityRole="alert"
              accessibilityViewIsModal
            >
              <View style={[s.iconCircle, { backgroundColor: bg, borderColor: border }]}>
                <Icon size={32} color={color} strokeWidth={2.2} />
              </View>

              <Text style={s.title}>{title}</Text>
              {message ? <Text style={s.message}>{message}</Text> : null}

              <View style={s.actions}>
                {secondaryAction && (
                  <TouchableOpacity
                    style={[s.btn, s.btnSecondary]}
                    onPress={() => runAndClose(secondaryAction)}
                    activeOpacity={0.75}
                  >
                    <Text style={s.btnSecondaryText}>{secondaryAction.label}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    s.btn,
                    { backgroundColor: primaryAction?.variant === 'destructive' ? Colors.error : color },
                  ]}
                  onPress={() => runAndClose(primaryAction ?? { label: 'OK' })}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnText}>{primaryAction?.label ?? 'OK'}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.xl,
    padding: Space.lg,
    alignItems: 'center',
    gap: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: Font.size.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Font.size.body * 1.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Space.sm,
    width: '100%',
  },
  btn: {
    flex: 1,
    minHeight: Layout.touch.comfortable,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  btnSecondary: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  btnSecondaryText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.semiBold,
    color: Colors.textSecondary,
  },
});