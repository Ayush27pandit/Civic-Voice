"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ReportIssueForm from "@/components/ReportIssueForm";
import Link from "next/link";

export default function NewIssuePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <nav className="border-b border-border bg-background px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-primary">CivicVoice</Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{user.displayName}</span>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Report a New Issue</h1>
                    <p className="text-muted-foreground">Please provide accurate details and location to help officials resolve it faster.</p>
                </div>

                <div className="card">
                    <ReportIssueForm />
                </div>
            </main>
        </div>
    );
}
