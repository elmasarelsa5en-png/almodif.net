'use client';

import { RoomsProvider } from '@/contexts/rooms-context';

export default function RoomsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoomsProvider>{children}</RoomsProvider>
    );
}