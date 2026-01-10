
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { usePageState } from '@/app/security/usePageState';
import { ACTION_KEYS } from '@/app/navigation/action-keys';

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

    // PHASE 15: Backend-driven Tab Visibility
    const { actions } = usePageState('Z_SETTINGS');

    // Get current entity from URL or default to 'sectors'
    const currentEntity = (searchParams.get('entity') as DictionaryEntity) || 'sectors';

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            prev.set('entity', value);
            return prev;
        });
    };

    // Calculate visibility
    const showSectors = actions[ACTION_KEYS.DICTIONARY_SECTORS_READ];
    const showUnits = actions[ACTION_KEYS.DICTIONARY_UNITS_READ];
    const showCurrencies = actions[ACTION_KEYS.DICTIONARY_CURRENCIES_READ];
    const showTimeZones = actions[ACTION_KEYS.DICTIONARY_TIMEZONES_READ];
    const showCountry = actions[ACTION_KEYS.DICTIONARY_COUNTRY_READ];
    const showCity = actions[ACTION_KEYS.DICTIONARY_CITY_READ];
    const showDistrict = actions[ACTION_KEYS.DICTIONARY_DISTRICT_READ];

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Soraqçalar</h2>

            <Tabs value={currentEntity} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    {showSectors && <TabsTrigger value="sectors">Sektorlar</TabsTrigger>}
                    {showUnits && <TabsTrigger value="units">Ölçü Vahidləri</TabsTrigger>}
                    {showCurrencies && <TabsTrigger value="currencies">Valyutalar</TabsTrigger>}
                    {showTimeZones && <TabsTrigger value="time_zones">Saat Qurşaqları</TabsTrigger>}

                    <div className="w-px h-4 bg-gray-200 mx-2 self-center" />

                    {showCountry && <TabsTrigger value="country">Ölkələr</TabsTrigger>}
                    {showCity && <TabsTrigger value="city">Şəhərlər</TabsTrigger>}
                    {showDistrict && <TabsTrigger value="district">Rayonlar</TabsTrigger>}
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
