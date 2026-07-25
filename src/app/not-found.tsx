import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileQuestion className="h-10 w-10" />
                </div>
                <h1 className="mt-6 text-3xl font-bold">404</h1>
                <h2 className="mt-2 text-xl font-semibold">Page Not Found</h2>
                <p className="mt-3 text-muted-foreground text-sm">
                    The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                >
                    <Home className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
