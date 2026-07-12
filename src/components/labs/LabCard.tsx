import React from 'react';
import { MapPin, Phone, Clock, FlaskConical, Navigation } from 'lucide-react';

interface LabCardProps {
    name: string;
    address: string;
    distance: string;
    phone: string;
    timings: string;
    tests: string[];
    rating: number;
    onBook?: (payload: { name: string; phone: string; address: string }) => void;
    onNavigate?: (address: string) => void;
}

const LabCard: React.FC<LabCardProps> = ({
    name,
    address,
    distance,
    phone,
    timings,
    tests,
    rating,
    onBook,
    onNavigate,
}) => {
    return (
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{distance} away</span>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2 py-1 rounded text-xs">
                    {rating} ★
                </div>
            </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 grow">
                {address}
            </p>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground/80">{timings}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground/80">{phone}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {tests.slice(0, 3).map((test, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-[10px] rounded font-medium border border-secondary/20">
                            {test}
                        </span>
                    ))}
                    {tests.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] rounded font-medium">
                            +{tests.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-3 mt-auto">
                <button
                    type="button"
                    onClick={() => {
                        if (onBook) {
                            onBook({ name, phone, address });
                            return;
                        }

                        const numericPhone = phone.replace(/[^\d+]/g, '');
                        if (numericPhone) {
                            window.open(`tel:${numericPhone}`, '_self');
                        }
                    }}
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
                >
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Book Test
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (onNavigate) {
                            onNavigate(address);
                            return;
                        }

                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                    }}
                    title="Open in Google Maps"
                    aria-label="Open in Google Maps"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-foreground shadow-sm transition-all hover:bg-muted hover:text-primary">
                    <Navigation className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default LabCard;
