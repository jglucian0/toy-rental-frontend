import { useState, useCallback } from "react";
import { useErrorHandler } from "./use-error-handler";

export function useAsyncOperation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(
    async (asyncFn: () => Promise<T>) => {
      try {
        setLoading(true);
        clearError();
        const result = await asyncFn();
        setData(result);
        return result;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError, handleError],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    clearError();
  }, [clearError]);

  return {
    loading,
    data,
    error,
    execute,
    reset,
    clearError,
  };
}
