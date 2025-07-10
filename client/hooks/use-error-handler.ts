import { useState, useCallback } from "react";

export interface ErrorState {
  message: string;
  details?: any;
  timestamp: number;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: any) => {
    console.error("Error occurred:", error);

    let message = "An unexpected error occurred";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }

    setError({
      message,
      details: error,
      timestamp: Date.now(),
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryAction = useCallback(
    async (action: () => Promise<void>) => {
      try {
        clearError();
        await action();
      } catch (err) {
        handleError(err);
      }
    },
    [clearError, handleError],
  );

  return {
    error,
    handleError,
    clearError,
    retryAction,
  };
}
