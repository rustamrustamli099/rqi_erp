
export type HealthStatus = "OK" | "DEGRADED" | "CRITICAL";

export interface SystemMetric {
    id: string;
    label: string;
    value: number | string;
    unit?: string;
    change?: number; // percentage
    trend?: "up" | "down" | "neutral";
    status: HealthStatus;
}

export interface AlertRule {
    id: string;
    name: string;
    metricSource: "System" | "Billing" | "Security" | "Approvals";
    metricType: "Threshold" | "Event" | "Anomaly";
    condition: string; // e.g. "> 50%", "spike detected"
    severity: "INFO" | "WARNING" | "CRITICAL";
    channels: ("System" | "Email" | "SMS" | "Webhook")[];
    status: "Active" | "Muted";
    lastTriggered?: string;
}

export interface AnomalyConfig {
    metricId: string;
    enabled: boolean;
    sensitivity: "Low" | "Medium" | "High";
    baselineDays: number;
}
