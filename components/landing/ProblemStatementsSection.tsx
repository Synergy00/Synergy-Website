"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  Terminal,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Code,
  Tag,
} from "lucide-react";
import { Chip } from "@/components/shared/Chip";
import { Button } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import {
  DOMAIN_CATEGORIES,
  OFFICIAL_PROBLEM_STATEMENTS,
  ProblemStatement,
} from "@/lib/problem-statements";

export function ProblemStatementsSection() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalPs, setActiveModalPs] = useState<ProblemStatement | null>(null);

  const filteredPs = useMemo(() => {
    return OFFICIAL_PROBLEM_STATEMENTS.filter((ps) => {
      const matchesDomain =
        selectedDomain === "all" || ps.domainSlug === selectedDomain;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ps.id.toLowerCase().includes(q) ||
        ps.title.toLowerCase().includes(q) ||
        ps.domain.toLowerCase().includes(q) ||
        ps.shortDesc.toLowerCase().includes(q) ||
        ps.suggestedTech.some((t) => t.toLowerCase().includes(q));

      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, searchQuery]);

  return (
    <section id="problem-statements" className="py-24 relative z-10 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>CHALLENGE TRACKS & PROBLEM STATEMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-headline font-bold text-on-surface tracking-tight">
            Choose Your Track & Problem Statement
          </h2>
          <p className="text-sm sm:text-base text-outline mt-3 font-body">
            Explore official problem statements with designated PS IDs (PS01–PS10). Team leads select their official PS during team creation in the dashboard.
          </p>
        </div>

        {/* Search & Domain Filters */}
        <div className="space-y-4 mb-10">
          {/* Search bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by PS ID (e.g. PS01), title, or tech stack..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs sm:text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Domain Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {DOMAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedDomain(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-semibold transition-all ${
                  selectedDomain === cat.slug
                    ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-surface-container-high/60 text-outline hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Statements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPs.map((ps) => (
            <div
              key={ps.id}
              className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30 hover:border-primary/50 shadow-xl backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container/20 border border-primary/40 font-mono text-xs font-bold text-primary">
                    <span>{ps.id}</span>
                  </div>
                  <Chip
                    variant={
                      ps.difficulty === "Beginner Friendly"
                        ? "success"
                        : ps.difficulty === "Intermediate"
                        ? "amber"
                        : "lavender"
                    }
                    size="sm"
                  >
                    {ps.difficulty}
                  </Chip>
                </div>

                {/* Domain category */}
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-outline block mb-1">
                  {ps.domain}
                </span>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-2 leading-snug">
                  {ps.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-outline font-body leading-relaxed mb-4 line-clamp-3">
                  {ps.description}
                </p>

                {/* Suggested Tech Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {ps.suggestedTech.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-surface-container-lowest text-[10px] font-mono text-on-surface-variant border border-outline-variant/20"
                    >
                      {tech}
                    </span>
                  ))}
                  {ps.suggestedTech.length > 3 && (
                    <span className="text-[10px] text-outline font-mono">
                      +{ps.suggestedTech.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-[11px] text-outline font-body">
                  Select in Dashboard
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalPs(ps)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary/20 text-xs font-headline font-semibold text-primary hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPs.length === 0 && (
          <div className="text-center py-16 p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 max-w-md mx-auto">
            <Terminal className="w-8 h-8 text-outline/40 mx-auto mb-3" />
            <div className="font-headline font-bold text-base text-on-surface mb-1">
              No problem statements found
            </div>
            <p className="text-xs text-outline">
              Try modifying your search keywords or switching domain category tabs.
            </p>
          </div>
        )}
      </div>

      {/* Problem Statement Details Modal */}
      <Modal
        isOpen={!!activeModalPs}
        onClose={() => setActiveModalPs(null)}
        title={activeModalPs ? `${activeModalPs.id}: ${activeModalPs.title}` : "Problem Statement"}
        maxWidth="lg"
      >
        {activeModalPs && (
          <div className="space-y-6">
            {/* Header tags */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-primary px-2.5 py-0.5 rounded bg-primary-container/20 border border-primary/40">
                  {activeModalPs.id}
                </span>
                <span className="text-xs font-headline font-bold text-on-surface">
                  {activeModalPs.domain}
                </span>
              </div>
              <Chip
                variant={
                  activeModalPs.difficulty === "Beginner Friendly"
                    ? "success"
                    : activeModalPs.difficulty === "Intermediate"
                    ? "amber"
                    : "lavender"
                }
                size="sm"
              >
                {activeModalPs.difficulty}
              </Chip>
            </div>

            {/* Full description */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-headline font-bold tracking-wider text-outline">
                Challenge Overview
              </label>
              <p className="text-xs sm:text-sm text-on-surface font-body leading-relaxed">
                {activeModalPs.description}
              </p>
            </div>

            {/* Key Deliverables */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-headline font-bold tracking-wider text-outline">
                Key Scope & Deliverable Focus
              </label>
              <div className="space-y-2">
                {activeModalPs.keyDeliverables.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface font-body"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="block text-xs uppercase font-headline font-bold tracking-wider text-outline">
                Target User Demographic
              </label>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface font-body">
                {activeModalPs.targetAudience}
              </div>
            </div>

            {/* Recommended Stack */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-headline font-bold tracking-wider text-outline">
                Recommended Tech Stack & Accelerators
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {activeModalPs.suggestedTech.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs font-mono font-semibold text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-[11px] text-outline font-body">
                Selected by team lead when forming a team
              </span>
              <Button variant="ghost" size="sm" onClick={() => setActiveModalPs(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
