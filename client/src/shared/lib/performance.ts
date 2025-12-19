import { memo, useCallback, useMemo } from 'react';

/**
 * Performance Guard Utilities
 * 
 * These helpers serve as a standard interface for React performance optimizations.
 * Use them to document intent and centralize performance logic.
 */

// 1. Memoization Wrapper for Components
// Usage: export const MyComponent = withPerformance(MyComponentBase);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withPerformance = <T extends React.ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
) => {
    return memo(Component, propsAreEqual);
};

// 2. Callback Wrapper
// Usage: const handleClick = usePerformanceCallback(() => { ... }, [deps]);
export const usePerformanceCallback = <T extends (...args: unknown[]) => unknown>(
    callback: T,
    deps: React.DependencyList
) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(callback, deps);
};

// 3. Computed Value Wrapper
// Usage: const expensiveValue = usePerformanceMemo(() => computeSomething(), [deps]);
export const usePerformanceMemo = <T>(
    factory: () => T,
    deps: React.DependencyList
) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
};
