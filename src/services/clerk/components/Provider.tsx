"use client"

import { useIsDarkMode } from '@/hooks/userDarkMode';
import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Suspense } from 'react';

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
    const isDarkMode = useIsDarkMode()

    return (
        <Suspense>
            <ClerkProviderBase appearance={isDarkMode ? { baseTheme: [dark] } : undefined}>{children}</ClerkProviderBase>
        </Suspense>
    )

};