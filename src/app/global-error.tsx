'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Application Error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-6">
                    <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h2 className="mt-6 text-2xl font-bold">Oops! Something went wrong</h2>
                        <p className="mt-2 text-muted-foreground text-sm">
                            We've encountered an unexpected error while loading this page. Our team has been notified.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
