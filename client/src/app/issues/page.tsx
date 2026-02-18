"use client"


import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    priority: string;
    location: {
        city: string;
        address: string;
    };
    media: { url: string; type: string }[];
    reportedBy: { displayName: string };
    upvoteCount: number;
    createdAt: string;
}

export default function IssuesListPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: "", category: "" });
    const api = useApi();

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams(filter).toString();
            const res = await api.get(`/issues?${query}`);
            setIssues(res.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "resolved": return "bg-secondary text-white";
            case "pending": return "bg-accent text-white";
            case "in-progress": return "bg-primary text-white";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <nav className="border-b border-border bg-background px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-primary">CivicVoice</Link>
                    <Link href="/issues/new" className="btn-primary text-sm">Report Issue</Link>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-3xl font-bold">Public Issues</h1>

                    <div className="flex gap-4">
                        <select
                            className="rounded-lg border border-border bg-background p-2 text-sm"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <select
                            className="rounded-lg border border-border bg-background p-2 text-sm"
                            value={filter.category}
                            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            <option value="pothole">Pothole</option>
                            <option value="streetlight">Streetlight</option>
                            <option value="garbage">Garbage</option>
                            <option value="water">Water Leak</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
                        ))}
                    </div>
                ) : issues.length === 0 ? (
                    <div className="py-20 text-center">
                        <h2 className="text-xl font-medium">No issues found</h2>
                        <p className="text-muted-foreground">Be the first to report an issue in your area.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {issues.map((issue) => (
                            <Link key={issue._id} href={`/issues/${issue._id}`} className="card group hover:border-primary transition-colors">
                                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                                    {issue.media?.[0] ? (
                                        <Image
                                            src={issue.media[0].url}
                                            alt={issue.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                                    )}
                                    <span className={`absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusColor(issue.status)}`}>
                                        {issue.status}
                                    </span>
                                </div>

                                <h3 className="mb-1 line-clamp-1 text-lg font-bold">{issue.title}</h3>
                                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>

                                <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
                                    <span className="font-medium">{issue.location.city}</span>
                                    <span className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(issue.createdAt))} ago
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
