// apps/app1-farmer/src/providers/FeedbackDialogProvider.tsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import { FeedbackDialog } from '../components/FeedbackDialog';
import type { DialogAction, DialogVariant } from '../components/FeedbackDialog';

export interface ShowDialogOptions {
  variant: DialogVariant;
  title: string;
  message?: string;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  autoDismissMs?: number;
}

interface FeedbackDialogContextValue {
  showDialog: (options: ShowDialogOptions) => void;
  showSuccess: (title: string, message?: string, primaryAction?: DialogAction) => void;
  showError: (title: string, message?: string, primaryAction?: DialogAction) => void;
  hideDialog: () => void;
}

const FeedbackDialogContext = createContext<FeedbackDialogContextValue | null>(null);

export function FeedbackDialogProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ShowDialogOptions | null>(null);

  const showDialog = useCallback((opts: ShowDialogOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => setVisible(false), []);

  const showSuccess = useCallback(
    (title: string, message?: string, primaryAction?: DialogAction) =>
      showDialog({ variant: 'success', title, message, primaryAction }),
    [showDialog],
  );

  const showError = useCallback(
    (title: string, message?: string, primaryAction?: DialogAction) =>
      showDialog({ variant: 'error', title, message, primaryAction }),
    [showDialog],
  );

  return (
    <FeedbackDialogContext.Provider value={{ showDialog, showSuccess, showError, hideDialog }}>
      {children}
      {options && (
        <FeedbackDialog
          visible={visible}
          variant={options.variant}
          title={options.title}
          message={options.message}
          primaryAction={options.primaryAction}
          secondaryAction={options.secondaryAction}
          autoDismissMs={options.autoDismissMs}
          onRequestClose={hideDialog}
        />
      )}
    </FeedbackDialogContext.Provider>
  );
}

export function useFeedbackDialog() {
  const ctx = useContext(FeedbackDialogContext);
  if (!ctx) {
    throw new Error('useFeedbackDialog must be used within a FeedbackDialogProvider');
  }
  return ctx;
}