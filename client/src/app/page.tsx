"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const api = useApi();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/issues/stats/overview");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          CivicVoice
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          ) : user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.displayName}
              </span>
              <button
                onClick={signOut}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-primary text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Report &amp; Track{" "}
          <span className="text-primary">Local Issues</span>
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Empower your community by reporting civic issues — potholes, broken
          streetlights, garbage dumping, and more. Track resolution in
          real-time.
        </p>
        <div className="flex gap-4">
          {user ? (
            <Link href="/issues/new" className="btn-primary">
              Report an Issue
            </Link>
          ) : (
            <Link href="/login" className="btn-primary">
              Sign In to Report
            </Link>
          )}
          <Link
            href="/issues"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 font-semibold transition-colors hover:bg-muted"
          >
            View List
          </Link>
          <Link
            href="/issues/map"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-muted/50 px-6 py-2.5 font-semibold transition-colors hover:bg-muted"
          >
            Explore on Map
          </Link>
        </div>
      </section>

      {/* ── Stats Section ────────────────────────────── */}
      <section className="border-t border-border bg-muted px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { label: "Total Issues", value: stats.total, color: "text-primary" },
            { label: "Resolved", value: stats.resolved, color: "text-secondary" },
            { label: "Pending", value: stats.pending, color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
