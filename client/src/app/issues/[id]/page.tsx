"use client";

import { useState, useEffect, use } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import MediaUpload from "@/components/MediaUpload";

const MapDisplay = dynamic(() => import("@/components/MapDisplay"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-muted" />,
});

interface Comment {
    _id: string;
    user: { displayName: string; photoURL: string };
    text: string;
    createdAt: string;
}

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "resolved" | "dismissed";
    verificationStatus: "unverified" | "pending" | "verified" | "disputed";
    category: string;
    priority: string;
    location: {
        city: string;
        state: string;
        address: string;
        coordinates: { lat: number; lng: number };
    };
    media: { url: string; type: "image" | "video"; path: string }[];
    resolution?: {
        resolvedBy: { displayName: string };
        proofMedia: { url: string; type: "image" | "video"; path: string }[];
        officialNote: string;
        resolvedAt: string;
        verifiedAt?: string;
        disputeReason?: string;
    };
    reportedBy: { _id: string; displayName: string; photoURL: string };
    upvoteCount: number;
    upvotes: string[];
    comments: Comment[];
    createdAt: string;
}

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [resolving, setResolving] = useState(false);
    const [resProof, setResProof] = useState<{ url: string; type: "image" | "video"; path: string }[]>([]);
    const [resNote, setResNote] = useState("");
    const { user } = useAuth();
    const api = useApi();

    const fetchIssue = async () => {
        try {
            const res = await api.get(`/issues/${id}`);
            setIssue(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssue();
    }, [id]);

    const handleUpvote = async () => {
        if (!user) return alert("Please sign in to upvote");
        try {
            await api.post(`/issues/${id}/upvote`, {});
            fetchIssue();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to comment");
        if (!commentText.trim()) return;

        try {
            await api.post(`/issues/${id}/comment`, { text: commentText });
            setCommentText("");
            fetchIssue();
        } catch (error) {
            console.error(error);
        }
    };

    const handleResolve = async () => {
        if (resProof.length === 0) return alert("Proof media is required");
        try {
            await api.post(`/issues/${id}/resolve`, {
                proofMedia: resProof,
                officialNote: resNote,
            });
            setResolving(false);
            fetchIssue();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleVerify = async (verified: boolean) => {
        try {
            if (verified) {
                await api.post(`/issues/${id}/verify`, {});
            } else {
                const reason = prompt("Why are you disputing this resolution?");
                if (!reason) return;
                await api.post(`/issues/${id}/dispute`, { reason });
            }
            fetchIssue();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );

    if (!issue) return <div className="p-20 text-center">Issue not found</div>;

    const isReporter = user?._id === issue.reportedBy._id;
    const isOfficial = user?.role === "official" || user?.role === "admin";
    const hasUpvoted = user && issue.upvotes.includes(user._id);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <nav className="border-b border-border bg-background px-6 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <Link
                        href="/issues"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to listing
                    </Link>
                    <Link href="/" className="text-xl font-bold text-primary">
                        CivicVoice
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <div className="flex gap-2">
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${issue.status === "resolved" ? "bg-secondary" : "bg-primary"
                                                } text-white`}
                                        >
                                            {issue.status}
                                        </span>
                                        {issue.verificationStatus !== "unverified" && (
                                            <span
                                                className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${issue.verificationStatus === "verified"
                                                        ? "bg-green-600"
                                                        : issue.verificationStatus === "disputed"
                                                            ? "bg-red-600"
                                                            : "bg-blue-600"
                                                    } text-white`}
                                            >
                                                {issue.verificationStatus}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="mt-4 text-3xl font-bold">{issue.title}</h1>
                                </div>
                                <button
                                    onClick={handleUpvote}
                                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${hasUpvoted
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "border-border hover:bg-muted"
                                        }`}
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill={hasUpvoted ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 15l7-7 7 7"
                                        />
                                    </svg>
                                    <span className="font-bold">{issue.upvoteCount}</span>
                                </button>
                            </div>

                            <p className="text-lg leading-relaxed">{issue.description}</p>

                            {/* Media Gallery */}
                            {issue.media.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    {issue.media.map((m, i) => (
                                        <div key={i} className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                                            <img src={m.url} alt="issue" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resolution Section */}
                        {issue.status === "resolved" && issue.resolution && (
                            <div className="card border-2 border-secondary/30 bg-secondary/5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-secondary">Resolution Details</h2>
                                    <span className="text-xs text-muted-foreground">
                                        Fixed {formatDistanceToNow(new Date(issue.resolution.resolvedAt))} ago
                                    </span>
                                </div>
                                <p className="text-sm italic text-muted-foreground mb-4">
                                    " {issue.resolution.officialNote} "
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {issue.resolution.proofMedia.map((m, i) => (
                                        <div key={i} className="relative aspect-video overflow-hidden rounded-xl">
                                            <img src={m.url} alt="proof" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {issue.verificationStatus === "pending" && isReporter && (
                                    <div className="mt-6 border-t border-border pt-6">
                                        <p className="mb-4 font-bold">Is this issue fixed to your satisfaction?</p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleVerify(true)}
                                                className="btn-primary bg-secondary px-8 hover:bg-secondary/90"
                                            >
                                                Yes, Confirm Fix
                                            </button>
                                            <button
                                                onClick={() => handleVerify(false)}
                                                className="rounded-lg border border-accent px-8 py-2.5 font-bold text-accent transition-colors hover:bg-accent/5"
                                            >
                                                No, Dispute
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {issue.verificationStatus === "disputed" && (
                                    <div className="mt-6 rounded-lg bg-red-50 p-4 border border-red-100">
                                        <p className="text-sm font-bold text-red-700">Dispute Reason:</p>
                                        <p className="text-sm text-red-600">{issue.resolution.disputeReason}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Official Resolution Action */}
                        {isOfficial && issue.status !== "resolved" && (
                            <div className="card border-2 border-primary/20 bg-primary/5">
                                {resolving ? (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold">Mark as Resolved</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Upload proof (photo of the fix) and provide a note for the reporter.
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {resProof.map((m, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                                    <img src={m.url} alt="proof" className="h-full w-full object-cover" />
                                                </div>
                                            ))}
                                            <MediaUpload
                                                onUploadComplete={(m) => setResProof([...resProof, m])}
                                                folder="resolutions"
                                            />
                                        </div>
                                        <textarea
                                            value={resNote}
                                            onChange={(e) => setResNote(e.target.value)}
                                            placeholder="e.g. The pothole has been filled and leveled correctly."
                                            className="w-full rounded-lg border border-border bg-background p-3 text-sm"
                                            rows={3}
                                        />
                                        <div className="flex gap-4">
                                            <button onClick={handleResolve} className="btn-primary w-full">
                                                Submit Proof
                                            </button>
                                            <button
                                                onClick={() => setResolving(false)}
                                                className="w-full rounded-lg bg-muted text-sm font-bold"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setResolving(true)}
                                        className="btn-primary w-full bg-secondary hover:bg-secondary/90"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="card">
                            <h2 className="mb-6 text-xl font-bold">Discussion ({issue.comments.length})</h2>

                            <div className="space-y-6">
                                {issue.comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-4">
                                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                                            {comment.user.photoURL && (
                                                <Image src={comment.user.photoURL} alt="user" fill />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">{comment.user.displayName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {user ? (
                                <form onSubmit={handleAddComment} className="mt-8 flex gap-4">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 outline-none rounded-lg border border-border bg-background p-3 text-sm focus:border-primary"
                                        rows={2}
                                    />
                                    <button type="submit" className="btn-primary self-end px-6 py-2">
                                        Post
                                    </button>
                                </form>
                            ) : (
                                <p className="mt-8 text-center text-sm italic text-muted-foreground">
                                    Sign in to join the discussion
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Location
                            </h3>
                            <MapDisplay
                                center={[issue.location.coordinates.lat, issue.location.coordinates.lng]}
                            />
                            <div className="mt-4">
                                <p className="font-medium">{issue.location.address}</p>
                                <p className="text-sm text-muted-foreground">
                                    {issue.location.city}, {issue.location.state}
                                </p>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Report Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium capitalize">{issue.category}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Priority</span>
                                    <span
                                        className={`font-medium capitalize ${issue.priority === "critical" ? "text-accent" : "text-foreground"
                                            }`}
                                    >
                                        {issue.priority}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Reported by</span>
                                    <span className="font-medium">{issue.reportedBy.displayName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
