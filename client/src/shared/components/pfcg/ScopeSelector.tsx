import { useEffect, useState } from 'react';
import { axiosInstance } from '@/services/axiosInstance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Building2, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface ScopeOption {
    scopeType: 'SYSTEM' | 'TENANT';
    scopeId: string | null;
    label: string;
}

export interface CurrentContext {
    scopeType: 'SYSTEM' | 'TENANT';
    scopeId: string | null;
    userId: string;
}

interface ScopeSelectorProps {
    onContextChange: (ctx: CurrentContext) => void;
}

export const ScopeSelector = ({ onContextChange }: ScopeSelectorProps) => {
    const [scopes, setScopes] = useState<ScopeOption[]>([]);
    const [currentContext, setCurrentContext] = useState<CurrentContext | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchScopes = async () => {
        try {
            const res = await axiosInstance.get('/session/scopes');
            setScopes(res.data);
        } catch (e) {
            console.error('Failed to fetch scopes', e);
        }
    };

    const fetchCurrentContext = async () => {
        try {
            const res = await axiosInstance.get('/session/context');
            setCurrentContext(res.data);
            onContextChange(res.data);
        } catch (e) {
            console.error('Failed to fetch context', e);
        }
    };

    useEffect(() => {
        fetchScopes();
        fetchCurrentContext();
    }, []);

    const handleSwitch = async (value: string) => {
        setLoading(true);
        try {
            // value format: "TYPE:ID" or "TYPE:null"
            const [type, id] = value.split(':');
            const targetId = id === 'null' ? null : id;

            // Call Backend Switch
            await axiosInstance.post('/session/context', {
                scopeType: type,
                scopeId: targetId
            });

            // Reload Context (Token refreshed loosely via cookie usually, or we assume handled)
            // Ideally we need to reload page or re-fetch current context to confirm.
            // For SPA, we re-fetch context.
            await fetchCurrentContext();

            toast({
                title: "Context Switched",
                description: `Switched to ${type} ${targetId ? targetId : ''}`,
            });

        } catch (e: any) {
            toast({
                title: "Switch Failed",
                description: e.response?.data?.message || "Could not switch context",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!currentContext) return <div>Loading context...</div>;

    const currentValue = `${currentContext.scopeType}:${currentContext.scopeId}`;

    return (
        <Card className="border-l-4 border-l-primary mb-6">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {currentContext.scopeType === 'SYSTEM' ? <Globe className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                            Active Context: {currentContext.scopeType} {currentContext.scopeId && `(${currentContext.scopeId})`}
                        </CardTitle>
                        <CardDescription>
                            Select the scope you want to administer. Your actions (Create Role, Assign) will be bound to this scope.
                        </CardDescription>
                    </div>
                    <div className="w-[300px]">
                        <Select value={currentValue} onValueChange={handleSwitch} disabled={loading}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Scope" />
                            </SelectTrigger>
                            <SelectContent>
                                {scopes.map((s, idx) => (
                                    <SelectItem key={idx} value={`${s.scopeType}:${s.scopeId}`}>
                                        <div className="flex items-center gap-2">
                                            {s.scopeType === 'SYSTEM' ? <Globe className="h-4 w-4 text-muted-foreground" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                                            <span>{s.label || `${s.scopeType} ${s.scopeId || ''}`}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};
