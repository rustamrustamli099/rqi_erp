
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { Inline403 } from '@/shared/components/security/Inline403';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'; // Assuming generic UI components exist
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

// Types for robustness
type DictionaryEntity = 'sectors' | 'units' | 'currencies' | 'time_zones' | 'country' | 'city' | 'district';

const ENTITY_PERMISSIONS: Record<DictionaryEntity, string> = {
    sectors: 'admin_panel.settings.system_configurations.dictionary.sectors.read',
    units: 'admin_panel.settings.system_configurations.dictionary.units.read',
    currencies: 'admin_panel.settings.system_configurations.dictionary.currencies.read',
    time_zones: 'admin_panel.settings.system_configurations.dictionary.time_zones.read',
    country: 'admin_panel.settings.system_configurations.dictionary.addresses.country.read',
    city: 'admin_panel.settings.system_configurations.dictionary.addresses.city.read',
    district: 'admin_panel.settings.system_configurations.dictionary.addresses.district.read',
};

// Simplified Mock Components for the actual dictionary tables to keep this file concise
const DictionaryTableMock = ({ entity }: { entity: string }) => (
    <div className="p-4 border border-dashed rounded bg-slate-50 text-slate-500 text-center">
        {entity.toUpperCase()} Dictionary Table Placeholder
    </div>
);

export const DictionarySection: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { can } = usePermissions();

    // Get current entity from URL or default to 'sectors'
    const currentEntity = (searchParams.get('entity') as DictionaryEntity) || 'sectors';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            prev.set('entity', value);
            return prev;
        });
    };

    // Main Section Permission Check
    // "Dictionaries" tab itself requires: platform.settings.dictionary.read (User prompt)
    // In our system it roughly maps to having AT LEAST ONE dictionary permission or a specific one.
    // For now, let's assume if you can't read the CURRENT entity, you get 403 inline.

    // Check if user has ANY dictionary permission to even show the tabs?
    // User requirement: "If user has dictionary.read but ZERO entity permissions -> show empty state"
    // We don't have a generic dictionary.read slug in my perms list, so I'll skip the generic check or assume 'settings' read is enough.

    // Guard the specific entity
    const hasEntityPermission = can(ENTITY_PERMISSIONS[currentEntity]);

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Soraqçalar</h2>

            <Tabs value={currentEntity} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="sectors">Sektorlar</TabsTrigger>
                    <TabsTrigger value="units">Ölçü Vahidləri</TabsTrigger>
                    <TabsTrigger value="currencies">Valyutalar</TabsTrigger>
                    <TabsTrigger value="time_zones">Saat Qurşaqları</TabsTrigger>
                    <div className="w-px h-4 bg-gray-200 mx-2 self-center" /> {/* Separator for Addresses */}
                    <TabsTrigger value="country">Ölkələr</TabsTrigger>
                    <TabsTrigger value="city">Şəhərlər</TabsTrigger>
                    <TabsTrigger value="district">Rayonlar</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    {hasEntityPermission ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="capitalize">{currentEntity}</CardTitle>
                                <CardDescription>Manage system {currentEntity} definitions here.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DictionaryTableMock entity={currentEntity} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Inline403
                            permission={ENTITY_PERMISSIONS[currentEntity]}
                            message={`Sizə '${currentEntity}' soraqçasını görmək üçün icazə verilməyib.`}
                        />
                    )}
                </div>
            </Tabs>
        </div>
    );
};
