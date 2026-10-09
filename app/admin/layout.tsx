"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Shield,
  Trophy,
  Sliders,
  LogOut,
  Menu,
  X,
  Zap,
  Layers,
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // If on login page, don't show the admin shell sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Teams Directory", href: "/admin/teams", icon: Layers },
    { name: "Round 2 Shortlisting", href: "/admin/shortlisting", icon: Trophy },
    { name: "Round 2 Attendance", href: "/admin/round2-attendance", icon: CheckCircle2 },
    { name: "Event Controls", href: "/admin/event-controls", icon: Sliders },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      document.cookie = "protohack_admin_session=; path=/; max-age=0";
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="admin" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-xl p-6 fixed inset-y-0 left-0 z-30">
        <div>
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-9 h-9 rounded-xl bg-primary-container/15 border border-primary/30 flex items-center justify-center text-primary group-hover:shadow-amber transition-all">
              <Zap className="w-5 h-5 fill-primary text-primary" />
            </div>
            <div>
              <div className="text-base font-bold font-headline tracking-wider text-on-surface flex items-center gap-1.5">
                <span>PROTOHACK</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary border border-secondary/30">
                  ADMIN
                </span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary/80 font-headline">
                Organizer Portal
              </div>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase font-headline font-bold tracking-wider transition-all",
                    isActive
                      ? "bg-primary-container text-on-primary shadow-amber"
                      : "text-outline hover:text-on-surface hover:bg-surface-container-high/60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-outline-variant/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase font-headline font-bold tracking-wider text-outline hover:text-error hover:bg-error-container/20 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-outline-variant/20 bg-surface-container-lowest/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg text-outline hover:text-on-surface"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-headline font-bold uppercase tracking-widest text-outline">
              ORGANIZER CONTROL PANEL · PROTOHACK 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-outline">Live Sync</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 sm:p-8 flex-1 relative z-10">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 bg-surface-container/95 border-r border-outline-variant/40 p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold font-headline text-primary">ADMIN MENU</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded text-outline hover:text-on-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase font-headline font-bold tracking-wider transition-all",
                        isActive
                          ? "bg-primary-container text-on-primary shadow-amber"
                          : "text-outline hover:text-on-surface hover:bg-surface-container-high"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase font-headline font-bold text-error hover:bg-error-container/20 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
