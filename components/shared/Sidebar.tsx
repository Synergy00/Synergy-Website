import React from "react";
import Link from "next/link";
import { Zap, LayoutDashboard, Flag, Lock, LogOut } from "lucide-react";

interface SidebarProps {
  userProfile: { fullName: string; participantId: string } | null;
  hasTeam: boolean;
  onLogout: () => void;
}

export function Sidebar({ userProfile, hasTeam, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 h-screen border-r border-outline-variant/30 bg-surface-container-lowest/50 backdrop-blur-xl hidden md:flex flex-col fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="p-6 border-b border-outline-variant/30">
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="w-5 h-5 text-primary group-hover:text-amber-200 transition-colors" />
          <span className="font-headline font-bold tracking-widest text-on-surface">
            PROTOHACK
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="text-xs font-headline font-bold uppercase tracking-wider text-outline mb-4 px-3">
          Dashboard
        </div>

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container/20 text-primary font-semibold transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </button>

        <div className="text-xs font-headline font-bold uppercase tracking-wider text-outline mt-8 mb-4 px-3">
          Event Stages
        </div>

        {hasTeam ? (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container transition-colors">
            <Flag className="w-5 h-5 text-success" />
            <span>Round 1: Build</span>
          </button>
        ) : (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-outline opacity-50 cursor-not-allowed">
            <Lock className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Round 1: Build</span>
              <span className="text-[10px] text-error">Create team first</span>
            </div>
          </button>
        )}

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-outline opacity-50 cursor-not-allowed mt-2">
          <Lock className="w-5 h-5" />
          <span>Round 2: Finale</span>
        </button>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs text-primary font-headline">
            {userProfile?.fullName.charAt(0) || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">
              {userProfile?.fullName || "Participant"}
            </span>
            <span className="text-[10px] font-mono text-outline">
              {userProfile?.participantId || "ID"}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-xs font-semibold text-outline hover:text-on-surface transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
