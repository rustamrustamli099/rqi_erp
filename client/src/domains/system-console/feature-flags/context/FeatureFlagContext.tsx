import React, { createContext, useContext, useState, useEffect } from "react";

export interface FeatureFlag {
    id: string;
    key: string;
    description: string;
    scope: "Global" | "Tenant" | "Role" | "User";
    status: boolean;
    environment: "Production" | "Staging" | "Dev";
    archived?: boolean;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
    { id: "1", key: "new_billing_ui", description: "Biling səhifəsinin yeni dizaynı", scope: "Global", status: true, environment: "Production" },
    { id: "2", key: "beta_ai_assistant", description: "Süni intellekt köməkçisi", scope: "Tenant", status: false, environment: "Production" },
    { id: "3", key: "experimental_reports", description: "Eksperimental hesabatlar", scope: "Role", status: true, environment: "Staging" },
];

interface FeatureFlagContextType {
    flags: FeatureFlag[];
    isEnabled: (key: string) => boolean;
    addFlag: (flag: FeatureFlag) => void;
    updateFlag: (id: string, updates: Partial<FeatureFlag>) => void;
    deleteFlag: (id: string) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, load this from API
    // For now, load from localStorage to persist across reloads during demo
    const [flags, setFlags] = useState<FeatureFlag[]>(() => {
        const saved = localStorage.getItem("feature_flags");
        return saved ? JSON.parse(saved) : DEFAULT_FLAGS;
    });

    useEffect(() => {
        localStorage.setItem("feature_flags", JSON.stringify(flags));
    }, [flags]);

    const isEnabled = (key: string) => {
        const flag = flags.find(f => f.key === key);
        // If flag doesn't exist, default to false (safe by default)
        // If flag is archived, it's false
        return flag && !flag.archived ? flag.status : false;
    };

    const addFlag = (flag: FeatureFlag) => {
        setFlags(prev => [...prev, flag]);
    };

    const updateFlag = (id: string, updates: Partial<FeatureFlag>) => {
        setFlags(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const deleteFlag = (id: string) => {
        setFlags(prev => prev.filter(f => f.id !== id));
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isEnabled, addFlag, updateFlag, deleteFlag }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
    }
    return context;
};
