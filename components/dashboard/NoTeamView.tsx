"use client";

import React from "react";
import { AlertTriangle, PlusCircle, KeyRound } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

interface NoTeamViewProps {
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
}

export function NoTeamView({ onOpenCreateModal, onOpenJoinModal }: NoTeamViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Warning Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-primary-container/10 border border-primary/40 flex items-start gap-4 shadow-amber-subtle">
        <div className="p-2 rounded-xl bg-primary-container/20 text-primary shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm font-body">
          <span className="font-bold font-headline text-primary block sm:inline mr-1">
            Mandatory Step:
          </span>
          <span className="text-on-surface">
            Every participant <strong>MUST</strong> be part of a team to proceed to Round 1. 
            Even if you are participating solo, you must <strong>Create a Team</strong>. Max 3 members per team. Team rosters are permanently locked upon formation.
          </span>
        </div>
      </div>

      {/* 2 Equal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Team Card */}
        <Card
          variant="glass"
          glow
          className="flex flex-col justify-between text-left cursor-pointer group"
          onClick={onOpenCreateModal}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/15 border border-primary/30 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-2">
              Create a Team
            </h2>
            <p className="text-sm text-outline font-body leading-relaxed mb-6">
              Become the team lead, choose a team name, and invite up to 2 peers by their Participant ID. (Solo participants must also do this).
            </p>
          </div>
          <Button variant="primary" size="md" className="w-full">
            Create Team
          </Button>
        </Card>

        {/* Join Team Card */}
        <Card
          variant="glass"
          glow
          className="flex flex-col justify-between text-left cursor-pointer group"
          onClick={onOpenJoinModal}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary mb-4 group-hover:scale-105 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface mb-2">
              Join a Team
            </h2>
            <p className="text-sm text-outline font-body leading-relaxed mb-6">
              Got a 6-character team code from your team lead? Enter it here to join your team instantly.
            </p>
          </div>
          <Button variant="secondary" size="md" className="w-full">
            Join Team
          </Button>
        </Card>
      </div>
    </div>
  );
}
