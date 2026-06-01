import { useEffect, type FC, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useAppDispatch } from '../../../../state/configureStore';
import { addToast } from '../../../../state/pageSlice';

const ErrorFallback: FC<FallbackProps> = ({ error }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.error('[GlobalErrorBoundary]', error);
    dispatch(addToast({ message: error instanceof Error ? error.message : 'An error occurred', severity: 'error' }));
  }, [dispatch, error]);

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'red' }}>
      <h2>An error occurred</h2>
      <p>{error instanceof Error ? error.message : String(error)}</p>
      <pre style={{ fontSize: 12, color: '#333' }}>{error instanceof Error ? error.stack : ''}</pre>
    </div>
  );
};

export const GlobalErrorBoundaryWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
);
