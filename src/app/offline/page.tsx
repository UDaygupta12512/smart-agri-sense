import { WifiOff, RefreshCcw } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <WifiOff className="h-10 w-10" />
                </div>
                <h1 className="mt-6 text-2xl font-bold">You are offline</h1>
                <p className="mt-3 text-muted-foreground text-sm">
                    It looks like you've lost your internet connection. Some features of SmartAgriSense require an active connection to fetch real-time data.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Try Reconnecting
                </button>
            </div>
        </div>
    );
}
