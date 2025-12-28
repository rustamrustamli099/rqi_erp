# Performance Budgets & Guards

To ensure a high-performance "SAP-beating" experience, we enforce the following budgets.

## 1. Bundle Size
- **Initial JS Bundle**: < 300KB (Gzipped)
- **Lazy Loaded Chunks**: < 100KB per domain view

## 2. Load Performance (Web Vitals)
- **LCP (Largest Contentful Paint)**: < 1.2s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 3. Realtime Latency
- **End-to-End Lag**: < 200ms
- **Render Frequency**: Cap expensive updates at 30fps (via throttle) if needed.

## 4. Enforcement Strategy
- **CI/CD**: `npm run build` will verify bundle sizes.
- **Runtime**: `TelemetryService` logs violations of Initial Load Time.
