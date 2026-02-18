"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Loading community map...</p>
            </div>
        </div>
    ),
});

export default function ExploreMapPage() {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* ── Overlay Navbar ───────────────────────────── */}
            <nav className="absolute left-4 right-4 top-4 z-[1000] flex items-center justify-between rounded-xl border border-border bg-background/80 px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/issues" className="rounded-full bg-muted p-2 transition-colors hover:bg-border">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold sm:text-lg">Explore Issues</h1>
                        <p className="hidden text-[10px] text-muted-foreground sm:block">Real-time civic status in your neighborhood</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/issues/new" className="btn-primary text-xs px-4 py-2">
                        Report Here
                    </Link>
                </div>
            </nav>

            {/* ── Map Container ────────────────────────────── */}
            <div className="flex-1 overflow-hidden">
                <GlobalMap />
            </div>

            {/* ── Legend ───────────────────────────────────── */}
            <div className="absolute bottom-6 left-4 z-[1000] rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-md">
                <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status Legend</h4>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-accent" /> Pending
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-primary" /> In Progress
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-secondary" /> Resolved
                    </div>
                </div>
            </div>
        </div>
    );
}
