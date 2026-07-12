'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function PestDetectionError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Pest Detection Error:', error);
    }, [error]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="mt-6 text-xl font-bold text-foreground">Scanner Unavailable</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                    The AI diagnostic server is currently unreachable. If you saved any previous diagnoses, you can still view them in the Voice Assistant's Knowledge Vault.
                </p>
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-orange-700 hover:scale-[1.02] active:scale-95"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Retry Scanner
                    </button>
                </div>
            </div>
        </div>
    );
}
