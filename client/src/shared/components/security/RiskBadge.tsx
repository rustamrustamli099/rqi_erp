/**
 * Risk Badge Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Visual indicator for risk levels.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskLevel, RiskScore, RiskReason } from '@/app/security/risk-scoring';

interface RiskBadgeProps {
    level: RiskLevel;
    score?: number;
    reasons?: RiskReason[];
    showScore?: boolean;
    showTooltip?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const levelConfig = {
    LOW: {
        label: 'AŞAĞI',
        labelEn: 'LOW',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        borderColor: 'border-green-300 dark:border-green-700',
        icon: ShieldCheck,
        emoji: '🟢'
    },
    MEDIUM: {
        label: 'ORTA',
        labelEn: 'MEDIUM',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        borderColor: 'border-orange-300 dark:border-orange-700',
        icon: Shield,
        emoji: '🟠'
    },
    HIGH: {
        label: 'YÜKSƏK',
        labelEn: 'HIGH',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        borderColor: 'border-red-300 dark:border-red-700',
        icon: ShieldAlert,
        emoji: '🔴'
    }
};

const sizeConfig = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
};

const iconSizeConfig = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
};

export function RiskBadge({
    level,
    score,
    reasons = [],
    showScore = false,
    showTooltip = true,
    size = 'md',
    className
}: RiskBadgeProps) {
    const config = levelConfig[level];
    const Icon = config.icon;

    const badge = (
        <Badge
            variant="outline"
            className={cn(
                'font-medium border',
                config.color,
                config.borderColor,
                sizeConfig[size],
                className
            )}
        >
            <Icon className={iconSizeConfig[size]} />
            <span>{config.label}</span>
            {showScore && score !== undefined && (
                <span className="opacity-75">({score})</span>
            )}
        </Badge>
    );

    if (!showTooltip || reasons.length === 0) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2">
                        <div className="font-medium flex items-center gap-2">
                            <span>{config.emoji}</span>
                            <span>Risk səviyyəsi: {config.label}</span>
                            {score !== undefined && <span>({score}/100)</span>}
                        </div>
                        {reasons.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Səbəblər:</p>
                                <ul className="text-xs space-y-0.5">
                                    {reasons.map((reason, i) => (
                                        <li key={i} className="flex items-start gap-1">
                                            <span className="text-muted-foreground">•</span>
                                            <span>{reason.descriptionAz}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {level === 'HIGH' && (
                            <p className="text-xs text-red-500 font-medium mt-1">
                                ⚠️ Bu rol 4-göz təsdiqi tələb edir
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * Risk Gauge Component - Visual meter for risk score
 */
interface RiskGaugeProps {
    score: number;
    level: RiskLevel;
    showLabel?: boolean;
    className?: string;
}

export function RiskGauge({ score, level, showLabel = true, className }: RiskGaugeProps) {
    const config = levelConfig[level];
    const percentage = Math.min(score, 100);

    const gaugeColor = {
        LOW: 'bg-green-500',
        MEDIUM: 'bg-orange-500',
        HIGH: 'bg-red-500'
    }[level];

    return (
        <div className={cn('space-y-1', className)}>
            {showLabel && (
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Skoru</span>
                    <span className={cn('font-medium', config.color.split(' ')[1])}>
                        {config.emoji} {score}/100
                    </span>
                </div>
            )}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', gaugeColor)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

/**
 * Compact Risk Indicator - For tables
 */
interface RiskIndicatorProps {
    level: RiskLevel;
    className?: string;
}

export function RiskIndicator({ level, className }: RiskIndicatorProps) {
    const config = levelConfig[level];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <span className={cn('text-lg cursor-help', className)}>
                        {config.emoji}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <span>Risk: {config.label}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default RiskBadge;
