'use client';

import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Loading Module...</h2>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we prepare your workspace.</p>
            </div>
        </div>
    );
}
