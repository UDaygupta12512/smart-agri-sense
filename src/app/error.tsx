'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">Something went wrong!</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                    We encountered an error while loading this section. You can try reloading or return to the dashboard.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => reset()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 font-semibold text-foreground transition-all hover:bg-muted/80 hover:scale-[1.02] active:scale-95"
                    >
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
