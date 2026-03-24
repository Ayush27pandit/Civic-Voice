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
    <div className="min-h-screen w-full relative">
      {/* Aurora Waves Pattern */}
      <style>{`
        @keyframes aurora {
          0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #1e1b4b 100%)`,
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(14, 165, 233, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 70% 20%, rgba(251, 146, 60, 0.15) 0%, transparent 50%)
          `,
          animation: "aurora 12s linear infinite",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-[#09090b]" />

      {/* ── Navbar ────────────────────────────────────── */}
      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            CivicVoice
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/issues" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Browse Issues
            </Link>
            <Link href="/issues/map" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Map View
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
            ) : user ? (
              <>
                <span className="text-sm font-medium text-white/60">{user.displayName}</span>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-medium text-black transition-all hover:shadow-lg hover:shadow-sky-500/25"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative z-10 overflow-hidden pt-32 pb-24">
        <div className="relative mx-auto max-w-7xl px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-white/60">Live tracking • Real-time updates</span>
            </div>
            
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Report civic issues.<br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Track resolutions.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/50">
              Help improve your neighborhood by reporting local issues. Get real-time updates as authorities work to resolve them.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <Link 
                  href="/issues/new" 
                  className="group relative rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-xl hover:shadow-sky-500/30"
                >
                  Report an Issue
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="group relative rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-xl hover:shadow-sky-500/30"
                >
                  Get Started
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              )}
              <Link 
                href="/issues" 
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
              >
                Browse Issues
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────── */}
      <section className="relative z-10 border-y border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            {[
              { label: "Total Reports", value: stats.total.toLocaleString(), color: "from-sky-400 to-cyan-400" },
              { label: "Resolved", value: stats.resolved.toLocaleString(), color: "from-emerald-400 to-teal-400" },
              { label: "Pending", value: stats.pending.toLocaleString(), color: "from-orange-400 to-amber-400" },
            ].map((stat, i) => (
              <div key={i}>
                <p className={`text-5xl font-semibold tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent sm:text-6xl`}>
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────── */}
      <section className="relative z-10 bg-[#09090b]/80 px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Report",
                description: "Take a photo, drop a pin on the map, and describe the issue. It takes less than a minute.",
                color: "from-sky-500 to-cyan-500",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Track",
                description: "Follow real-time updates as officials review and address your reported issue.",
                color: "from-violet-500 to-purple-500",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Resolve",
                description: "Get notified when the issue is fixed. Verify the resolution and close the report.",
                color: "from-emerald-500 to-teal-500",
                icon: (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div key={i} className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 backdrop-blur transition-all hover:border-white/20">
                <div className="absolute right-6 top-6 text-6xl font-semibold text-white/[0.03]">
                  {feature.step}
                </div>
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-r p-3 text-white ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────── */}
      <section className="relative z-10 border-y border-white/10 bg-black/40 px-8 py-24 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Report any issue
            </h2>
            <p className="mt-3 text-white/40">From potholes to broken streetlights, we handle it all.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: "🕳️", label: "Potholes", color: "hover:bg-orange-500/20 hover:border-orange-500/30" },
              { icon: "💡", label: "Streetlights", color: "hover:bg-amber-500/20 hover:border-amber-500/30" },
              { icon: "🗑️", label: "Garbage", color: "hover:bg-lime-500/20 hover:border-lime-500/30" },
              { icon: "💧", label: "Water", color: "hover:bg-sky-500/20 hover:border-sky-500/30" },
              { icon: "🚧", label: "Roads", color: "hover:bg-gray-500/20 hover:border-gray-500/30" },
              { icon: "⚡", label: "Electricity", color: "hover:bg-yellow-500/20 hover:border-yellow-500/30" },
              { icon: "🏗️", label: "Sewage", color: "hover:bg-rose-500/20 hover:border-rose-500/30" },
              { icon: "📍", label: "Other", color: "hover:bg-violet-500/20 hover:border-violet-500/30" },
            ].map((cat, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all ${cat.color}`}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium text-white/70">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-sky-900 via-cyan-900 to-teal-900 px-8 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.3),transparent_50%)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Make your voice heard
          </h2>
          <p className="mt-4 text-white/60">
            Join thousands of citizens improving their communities.
          </p>
          {user ? (
            <Link 
              href="/issues/new" 
              className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-black/20"
            >
              Report an Issue
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-black/20"
            >
              Join CivicVoice
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09090b] px-8 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-sm font-medium text-white/40">CivicVoice</p>
          <p className="text-sm text-white/20">Building better communities.</p>
        </div>
      </footer>
    </div>
  );
}
