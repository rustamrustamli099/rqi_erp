import React, { createContext, useContext, useState } from 'react';

interface HelpContextType {
    pageKey: string;
    setPageKey: (key: string) => void;
    isOpen: boolean;
    toggleHelp: () => void;
    openHelp: (key?: string) => void;
    closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: React.ReactNode }) {
    const [pageKey, setPageKeyState] = useState<string>("sys-admin");
    const [isOpen, setIsOpen] = useState(false);

    const setPageKey = (key: string) => {
        setPageKeyState(key);
    };

    const toggleHelp = () => setIsOpen(prev => !prev);

    const openHelp = (key?: string) => {
        if (key) setPageKeyState(key);
        setIsOpen(true);
    };

    const closeHelp = () => setIsOpen(false);

    return (
        <HelpContext.Provider value={{ pageKey, setPageKey, isOpen, toggleHelp, openHelp, closeHelp }}>
            {children}
        </HelpContext.Provider>
    );
}

export function useHelp() {
    const context = useContext(HelpContext);
    if (context === undefined) {
        throw new Error('useHelp must be used within a HelpProvider');
    }
    return context;
}
