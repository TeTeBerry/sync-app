import { useEffect, useRef, useState, type ComponentType } from 'react';

type LoaderResult<TProps extends object> =
  | { default: ComponentType<TProps> }
  | Record<string, ComponentType<TProps>>;

export function useLazyComponent<TProps extends object>(
  loader: () => Promise<LoaderResult<TProps>>,
  pick: 'default' | string,
  enabled: boolean,
): {
  Component: ComponentType<TProps> | null;
  loading: boolean;
  error: unknown;
} {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [Component, setComponent] = useState<ComponentType<TProps> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled || Component) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loaderRef
      .current()
      .then((mod) => {
        if (cancelled) {
          return;
        }
        const picked =
          pick === 'default'
            ? (mod as { default: ComponentType<TProps> }).default
            : (mod as Record<string, ComponentType<TProps>>)[pick];
        if (!picked) {
          throw new Error(`Lazy component "${pick}" not found in module`);
        }
        setComponent(() => picked);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, Component, pick]);

  return { Component, loading, error };
}
