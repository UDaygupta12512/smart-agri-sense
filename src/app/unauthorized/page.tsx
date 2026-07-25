import Link from 'next/link';
import { Lock, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Lock className="h-10 w-10" />
                </div>
                <h1 className="mt-6 text-3xl font-bold">401</h1>
                <h2 className="mt-2 text-xl font-semibold">Unauthorized Access</h2>
                <p className="mt-3 text-muted-foreground text-sm">
                    You need to be logged in to access this page. Please sign in to continue.
                </p>
                <Link
                    href="/login"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                >
                    <LogIn className="h-4 w-4" />
                    Go to Login
                </Link>
            </div>
        </div>
    );
}
