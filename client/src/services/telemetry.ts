class TelemetryService {
    private metrics: Record<string, number[]> = {};

    trackLatency(metricName: string, durationMs: number) {
        if (!this.metrics[metricName]) {
            this.metrics[metricName] = [];
        }
        this.metrics[metricName].push(durationMs);

        // Log slow requests
        if (durationMs > 1000) {
            console.warn(`[Telemetry] Slow operation detected: ${metricName} took ${durationMs}ms`);
        }
    }

    logError(error: Error, context: string) {
        console.error(`[Telemetry] Error in ${context}:`, error);
        // In production, send to Sentry / LogRocket
    }

    getMetrics() {
        return this.metrics;
    }
}

export const telemetry = new TelemetryService();
