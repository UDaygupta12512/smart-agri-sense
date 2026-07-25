'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Feature Error:', error);
    }, [error]);

    return (
        <div className="flex w-full flex-col items-center justify-center p-6 text-center h-full min-h-[300px]">
            <div className="max-w-md w-full rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">Failed to load feature</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                    We couldn't load this section properly.
                </p>
                <button
                    onClick={() => reset()}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2 font-medium transition-all hover:bg-secondary/80"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </button>
            </div>
        </div>
    );
}
