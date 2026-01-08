import { useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
    title: string;
    updated: string;
    children: ReactNode;
}

export default function LegalLayout({ title, updated, children }: Props) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Last updated: {updated}
                </p>

                <hr className="my-8 border-slate-200" />

                <div className="space-y-8 text-slate-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
