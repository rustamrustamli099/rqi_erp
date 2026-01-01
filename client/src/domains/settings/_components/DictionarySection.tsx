
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

/**
 * SAP-GRADE: This component renders ONLY if user has access.
 * Access is enforced by:
 * 1. ProtectedRoute (route-level guard)
 * 2. Decision Center (resolveNavigationTree)
 * 
 * NO UI-level permission checks needed.
 * Tab visibility is controlled by the navigation resolver.
 */

type DictionaryEntity = 'sectors' | 'units' | 'currencies' | 'time_zones' | 'country' | 'city' | 'district';

// Simplified Mock Components for the actual dictionary tables
const DictionaryTableMock = ({ entity }: { entity: string }) => (
    <div className="p-4 border border-dashed rounded bg-slate-50 text-slate-500 text-center">
        {entity.toUpperCase()} Dictionary Table Placeholder
    </div>
);

export const DictionarySection: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get current entity from URL or default to 'sectors'
    const currentEntity = (searchParams.get('entity') as DictionaryEntity) || 'sectors';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            prev.set('entity', value);
            return prev;
        });
    };

    // SAP-GRADE: Access is enforced by ProtectedRoute
    // Tab visibility is controlled by navigation resolver
    // NO UI-level permission checks
    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Soraqçalar</h2>

            <Tabs value={currentEntity} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="sectors">Sektorlar</TabsTrigger>
                    <TabsTrigger value="units">Ölçü Vahidləri</TabsTrigger>
                    <TabsTrigger value="currencies">Valyutalar</TabsTrigger>
                    <TabsTrigger value="time_zones">Saat Qurşaqları</TabsTrigger>
                    <div className="w-px h-4 bg-gray-200 mx-2 self-center" />
                    <TabsTrigger value="country">Ölkələr</TabsTrigger>
                    <TabsTrigger value="city">Şəhərlər</TabsTrigger>
                    <TabsTrigger value="district">Rayonlar</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="capitalize">{currentEntity}</CardTitle>
                            <CardDescription>Manage system {currentEntity} definitions here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DictionaryTableMock entity={currentEntity} />
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
};
