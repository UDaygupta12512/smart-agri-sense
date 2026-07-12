'use client';

import { FlaskConical, Beaker, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLabsData } from '@/lib/dynamicDashboardData';

export default function SoilLabsPage() {
    const [labs, setLabs] = useState<any[]>([]);

    useEffect(() => {
        setLabs(getLabsData());
    }, []);

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <FlaskConical className="h-8 w-8 text-purple-500" />
                        Soil & Water Labs
                    </h1>
                    <p className="text-muted-foreground mt-1">Book lab tests and view your soil health reports.</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                    <Beaker className="h-4 w-4" /> Book New Test
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labs.length > 0 ? labs.map((lab: any, i: number) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg">{lab.testName || 'Standard Soil Test'}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${lab.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {lab.status || 'Completed'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Date: {lab.date || 'Recent'}</p>
                        
                        <div className="space-y-2 mb-4 bg-muted/50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between"><span>pH Level:</span> <span className="font-medium">{lab.ph || '6.8'}</span></div>
                            <div className="flex justify-between"><span>Nitrogen (N):</span> <span className="font-medium">{lab.n || 'Low'}</span></div>
                            <div className="flex justify-between"><span>Phosphorus (P):</span> <span className="font-medium">{lab.p || 'Medium'}</span></div>
                        </div>

                        <button className="w-full text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                            <FileText className="h-4 w-4" /> View Full Report
                        </button>
                    </div>
                )) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                        <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-lg font-medium text-foreground">No Lab Reports Found</p>
                        <p className="max-w-sm mt-1">You haven't requested any soil or water tests yet. Book a new test to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
