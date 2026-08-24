import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 rounded-lg border border-zinc-300 bg-white shadow-sm flex items-start justify-between gap-3 text-xs text-zinc-900">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-900">Document Processing Error</p>
          <p className="text-zinc-600 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-mono underline text-zinc-900 hover:text-zinc-600 pt-1 block"
            >
              Try again
            </button>
          )}
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-zinc-400 hover:text-zinc-900 p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
