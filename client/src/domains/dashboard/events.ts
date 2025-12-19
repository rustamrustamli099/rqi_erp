export const DASHBOARD_EVENTS = {
    REFRESH_REQUESTED: 'dashboard:refresh_requested',
    WIDGET_UPDATED: 'dashboard:widget_updated',
} as const;

export interface DashboardWidgetUpdatePayload {
    widgetId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}
