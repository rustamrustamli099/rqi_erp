/**
 * SoD (Segregation of Duties) Conflict Modal
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bank-grade conflict warning modal.
 * Shows when role/user has conflicting permissions.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    AlertTriangle,
    AlertCircle,
    ShieldAlert,
    Info,
    XCircle,
    FileText
} from 'lucide-react';
import type { SoDConflict, SoDValidationResult, SoDRiskLevel } from '@/app/security/sod-rules';

interface SoDConflictModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    validationResult: SoDValidationResult;
    onProceedAnyway?: () => void; // Only for HIGH/MEDIUM conflicts
    onCancel: () => void;
    entityType: 'role' | 'user';
    entityName: string;
}

const RiskBadge = ({ level }: { level: SoDRiskLevel }) => {
    const config = {
        CRITICAL: { color: 'bg-red-500 text-white', icon: XCircle, label: 'KRİTİK' },
        HIGH: { color: 'bg-orange-500 text-white', icon: AlertTriangle, label: 'YÜKSƏK' },
        MEDIUM: { color: 'bg-yellow-500 text-black', icon: Info, label: 'ORTA' }
    };

    const { color, icon: Icon, label } = config[level];

    return (
        <Badge className={`${color} gap-1`}>
            <Icon className="w-3 h-3" />
            {label}
        </Badge>
    );
};

export function SoDConflictModal({
    open,
    onOpenChange,
    validationResult,
    onProceedAnyway,
    onCancel,
    entityType,
    entityName
}: SoDConflictModalProps) {
    const [showDetails, setShowDetails] = useState(true);

    const hasCritical = validationResult.criticalCount > 0;
    const hasHigh = validationResult.highCount > 0;
    const hasMedium = validationResult.mediumCount > 0;

    const entityLabel = entityType === 'role' ? 'Rol' : 'İstifadəçi';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Səlahiyyət Ayrılığı Konflikti
                            </DialogTitle>
                            <DialogDescription>
                                Segregation of Duties (SoD) pozuntusu aşkar edildi
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Summary Alert */}
                <Alert variant={hasCritical ? 'destructive' : 'default'} className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                        {entityLabel}: <strong>{entityName}</strong>
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                        {hasCritical ? (
                            <>
                                Bu {entityLabel.toLowerCase()} bank təhlükəsizlik qaydalarına zidd icazə kombinasiyası ehtiva edir.
                                <strong className="block mt-1">Dəyişikliklər yadda saxlanıla bilməz.</strong>
                            </>
                        ) : hasHigh ? (
                            <>
                                Bu {entityLabel.toLowerCase()} yüksək riskli icazə kombinasiyası ehtiva edir.
                                <strong className="block mt-1">Əlavə təsdiq tələb olunacaq.</strong>
                            </>
                        ) : (
                            <>
                                Bu {entityLabel.toLowerCase()} diqqət tələb edən icazə kombinasiyası ehtiva edir.
                            </>
                        )}
                    </AlertDescription>
                </Alert>

                {/* Conflict Count Summary */}
                <div className="flex gap-3 mt-3">
                    {hasCritical && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            <XCircle className="w-4 h-4" />
                            <span className="font-medium">{validationResult.criticalCount} Kritik</span>
                        </div>
                    )}
                    {hasHigh && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">{validationResult.highCount} Yüksək</span>
                        </div>
                    )}
                    {hasMedium && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                            <Info className="w-4 h-4" />
                            <span className="font-medium">{validationResult.mediumCount} Orta</span>
                        </div>
                    )}
                </div>

                <Separator className="my-2" />

                {/* Conflict Details */}
                <ScrollArea className="flex-1 max-h-[300px] pr-4">
                    <Accordion type="single" collapsible defaultValue="conflicts" className="w-full">
                        <AccordionItem value="conflicts">
                            <AccordionTrigger className="text-sm font-medium">
                                Konflikt Detalları ({validationResult.conflicts.length})
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    {validationResult.conflicts.map((conflict, index) => (
                                        <ConflictCard key={conflict.rule.id} conflict={conflict} index={index} />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </ScrollArea>

                {/* Compliance References */}
                <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Compliance: SOC2 CC6.1-CC6.3, ISO 27001 A.9.2</span>
                    </div>
                </div>

                <DialogFooter className="mt-4 gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Geri Qayıt
                    </Button>
                    {!hasCritical && onProceedAnyway && (
                        <Button
                            variant={hasHigh ? 'destructive' : 'default'}
                            onClick={onProceedAnyway}
                        >
                            {hasHigh ? 'Təsdiqə Göndər' : 'Davam Et'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ConflictCard({ conflict, index }: { conflict: SoDConflict; index: number }) {
    return (
        <div className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <RiskBadge level={conflict.rule.riskLevel} />
                        <span className="font-medium text-sm">{conflict.rule.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        {conflict.rule.descriptionAz}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {conflict.foundPermissions.map(perm => (
                            <code
                                key={perm}
                                className="px-2 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            >
                                {perm}
                            </code>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                    <strong>Tövsiyə:</strong> {conflict.rule.recommendationAz}
                </p>
            </div>
        </div>
    );
}

export default SoDConflictModal;
