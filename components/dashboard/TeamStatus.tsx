"use client";

import React from "react";
import Link from "next/link";
import { Check, Copy, Crown, Users, Terminal, ArrowRight, MessageCircle, ExternalLink } from "lucide-react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";

interface TeamMember {
  id: string;
  fullName: string;
  participantId: string;
  role: "lead" | "member";
  college: string;
}

interface TeamData {
  id: string;
  name: string;
  code: string;
  status: "round1" | "shortlisted";
  problemStatementId?: string;
  problemStatementTitle?: string;
  problemStatementDomain?: string;
  members: TeamMember[];
}

interface TeamStatusProps {
  team: TeamData;
  eventSettings: {
    countdownLabel: string;
    countdownTarget: string | null;
    round1Unlocked: boolean;
  };
  globalSettings: {
    whatsapp_group_link: string;
  };
  copyCode: (code: string) => void;
  copiedCode: boolean;
}

export function TeamStatus({
  team,
  eventSettings,
  globalSettings,
  copyCode,
  copiedCode,
}: TeamStatusProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Countdown Card */}
      <CountdownTimer
        label={eventSettings.countdownLabel}
        targetDate={eventSettings.countdownTarget}
        round1Unlocked={eventSettings.round1Unlocked}
      />

      {/* Your Team Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
          <div>
            <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
              YOUR TEAM
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mt-1">
              {team.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-outline font-headline font-semibold">
              Team Code:
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-primary/40 shadow-inner">
              <span className="font-mono text-base font-bold text-primary tracking-widest">
                {team.code}
              </span>
              <button
                onClick={() => copyCode(team.code)}
                className="hover:text-primary text-outline transition-colors"
                title="Copy Team Code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="mt-6">
          <div className="text-xs uppercase font-headline font-bold tracking-wider text-outline mb-4">
            Team Members ({team.members.length} / 3)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-xs text-primary font-headline">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    {member.role === "lead" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary-container/20 text-primary border border-primary/30">
                        <Crown className="w-3 h-3 fill-primary" /> Lead
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-on-surface font-headline">
                    {member.fullName}
                  </div>
                  <div className="text-xs font-mono text-outline mt-0.5">
                    {member.participantId}
                  </div>
                </div>
                <div className="text-[11px] text-outline/80 mt-3 pt-2 border-t border-outline-variant/20 truncate">
                  {member.college}
                </div>
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: 3 - team.members.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-4 rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center text-center bg-surface-container-lowest/30"
              >
                <Users className="w-6 h-6 text-outline/40 mb-2" />
                <span className="text-xs font-headline font-semibold text-outline">
                  Empty Slot
                </span>
                <span className="text-[10px] text-outline/60 mt-1">
                  Share team code to join
                </span>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* Official WhatsApp Community Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-container/95 via-surface-container/90 to-[#25D366]/10 border border-[#25D366]/30 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1EBE5D] via-[#25D366] to-[#48E585] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 shrink-0">
            <MessageCircle className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-headline font-bold text-on-surface">
                Join Official WhatsApp Community Group
              </h3>
              <Chip variant="success" size="sm" pulse>
                OFFICIAL
              </Chip>
            </div>
            <p className="text-xs text-outline font-body mt-0.5 max-w-xl">
              Get instantaneous round updates, mentor AMA sessions, problem statement releases, and 24/7 technical support.
            </p>
          </div>
        </div>

        <a
          href={globalSettings.whatsapp_group_link || "https://chat.whatsapp.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all font-headline font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#25D366]/30 shrink-0 hover:scale-105 active:scale-95"
        >
          <span>Join Group</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
