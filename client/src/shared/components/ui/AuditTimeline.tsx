/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUDIT TIMELINE - SOC2 Evidence Friendly Component
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import {
    Clock,
    User,
    CheckCircle,
    XCircle,
    Send,
    Edit,
    Trash,
    Shield,
    AlertTriangle,
    FileText,
    Download,
    Eye
} from 'lucide-react';

export interface AuditEvent {
    id: string;
    action: string;
    resource?: string;
    module?: string;
    actor?: {
        id: string;
        name: string;
        email?: string;
    };
    before?: any;
    after?: any;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
    createdAt: string;
}

interface AuditTimelineProps {
    events: AuditEvent[];
    showDiff?: boolean;
    title?: string;
}

export function AuditTimeline({ events, showDiff = true, title = 'Audit Timeline' }: AuditTimelineProps) {
    const getActionIcon = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create')) return <FileText className="w-4 h-4 text-green-500" />;
        if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="w-4 h-4 text-blue-500" />;
        if (actionLower.includes('delete')) return <Trash className="w-4 h-4 text-red-500" />;
        if (actionLower.includes('approve')) return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (actionLower.includes('reject')) return <XCircle className="w-4 h-4 text-red-500" />;
        if (actionLower.includes('submit') || actionLower.includes('send')) return <Send className="w-4 h-4 text-blue-500" />;
        if (actionLower.includes('export')) return <Download className="w-4 h-4 text-purple-500" />;
        if (actionLower.includes('view') || actionLower.includes('read')) return <Eye className="w-4 h-4 text-gray-500" />;
        if (actionLower.includes('login') || actionLower.includes('auth')) return <Shield className="w-4 h-4 text-blue-500" />;
        if (actionLower.includes('warning') || actionLower.includes('alert')) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        return <Clock className="w-4 h-4 text-gray-500" />;
    };

    const getActionColor = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create')) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        if (actionLower.includes('update')) return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
        if (actionLower.includes('delete')) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
        if (actionLower.includes('approve')) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        if (actionLower.includes('reject')) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('az-AZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const renderDiff = (before: any, after: any) => {
        if (!before && !after) return null;

        const beforeKeys = Object.keys(before || {});
        const afterKeys = Object.keys(after || {});
        const allKeys = [...new Set([...beforeKeys, ...afterKeys])];

        const changes = allKeys.filter(key => {
            const beforeVal = before?.[key];
            const afterVal = after?.[key];
            return JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
        });

        if (changes.length === 0) return null;

        return (
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono">
                {changes.map(key => (
                    <div key={key} className="mb-1">
                        <span className="text-gray-500">{key}: </span>
                        {before?.[key] !== undefined && (
                            <span className="text-red-600 line-through mr-2">
                                {JSON.stringify(before[key])}
                            </span>
                        )}
                        {after?.[key] !== undefined && (
                            <span className="text-green-600">
                                {JSON.stringify(after[key])}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Audit qeydi yoxdur</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {title && (
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {title}
                </h3>
            )}

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* Events */}
                <div className="space-y-4">
                    {events.map((event, index) => (
                        <div key={event.id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 ${index === 0 ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {getActionIcon(event.action)}
                            </div>

                            {/* Event card */}
                            <div className={`border-l-4 rounded-lg p-3 ${getActionColor(event.action)}`}>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="font-medium">{event.action}</span>
                                        {event.resource && (
                                            <span className="text-gray-500 ml-2">
                                                on {event.resource}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDateTime(event.createdAt)}
                                    </span>
                                </div>

                                {/* Actor */}
                                {event.actor && (
                                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="w-3 h-3" />
                                        <span>{event.actor.name}</span>
                                        {event.actor.email && (
                                            <span className="text-gray-400">({event.actor.email})</span>
                                        )}
                                    </div>
                                )}

                                {/* Details */}
                                {event.details && Object.keys(event.details).length > 0 && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {Object.entries(event.details).map(([key, value]) => (
                                            <div key={key} className="flex gap-2">
                                                <span className="font-medium">{key}:</span>
                                                <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Diff */}
                                {showDiff && (event.before || event.after) && renderDiff(event.before, event.after)}

                                {/* Meta */}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                                    {event.correlationId && <span>ID: {event.correlationId.slice(0, 8)}...</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Compact version for inline usage
 */
export function AuditTimelineCompact({ events }: { events: AuditEvent[] }) {
    if (events.length === 0) return null;

    return (
        <div className="text-sm space-y-1">
            {events.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-xs text-gray-400">
                        {new Date(event.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{event.action}</span>
                    {event.actor && <span className="text-gray-400">by {event.actor.name}</span>}
                </div>
            ))}
            {events.length > 5 && (
                <p className="text-xs text-gray-400">+{events.length - 5} daha...</p>
            )}
        </div>
    );
}
