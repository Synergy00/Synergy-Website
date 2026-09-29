"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  RefreshCw,
  Eye,
  FileText,
  ExternalLink,
  Users,
  Code,
  Check,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Modal } from "@/components/shared/Modal";
import { Chip } from "@/components/shared/Chip";
import { createClient } from "@/lib/supabase/client";

interface ShortlistTeam {
  id: string;
  name: string;
  code: string;
  leadName: string;
  memberCount: number;
  memberNames: string;
  status: "round1" | "shortlisted";
  problemStatementId?: string;
  problemStatementTitle?: string;
  problemStatementDomain?: string;
  pptUrl?: string;
  targetUsers?: string;
  techStack?: string;
  shortDesc?: string;
}

export default function AdminShortlistingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [teams, setTeams] = useState<ShortlistTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [confirmAction, setConfirmAction] = useState<"shortlist" | "remove" | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Review & Read Submission Modal State
  const [reviewTeam, setReviewTeam] = useState<ShortlistTeam | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadTeams = async () => {
    setLoading(true);
    try {
      const { data: teamsData, error } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          code,
          status,
          problem_statement_id,
          problem_statement_title,
          problem_statement_domain,
          team_members (
            role,
            profiles (
              full_name,
              college
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (teamsData && !error) {
        const formatted: ShortlistTeam[] = teamsData.map((t: any) => {
          const membersList = (t.team_members || []).map(
            (tm: any) => tm.profiles?.full_name || "Member"
          );
          const leadMember = (t.team_members || []).find((tm: any) => tm.role === "lead");

          return {
            id: t.id,
            name: t.name,
            code: t.code,
            leadName: leadMember?.profiles?.full_name || "Team Lead",
            memberCount: membersList.length,
            memberNames: membersList.join(", ") || "No members",
            status: t.status || "round1",
            problemStatementId: t.problem_statement_id || null,
            problemStatementTitle: t.problem_statement_title || "No problem statement selected",
            problemStatementDomain: t.problem_statement_domain || "Uncategorized",
            pptUrl: t.ppt_url || null,
            targetUsers: t.target_users || "No target users specified",
            techStack: t.tech_stack || "No tech stack specified",
            shortDesc: t.short_desc || "No description provided",
          };
        });
        setTeams(formatted);
      } else {
        setTeams([]);
      }
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.memberNames.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teams, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shortlistedCount = teams.filter((t) => t.status === "shortlisted").length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = new Set(filtered.map((t) => t.id));
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    setIsUpdating(true);

    const newStatus = confirmAction === "shortlist" ? "shortlisted" : "round1";
    const targetIds = Array.from(selectedIds);

    try {
      await supabase
        .from("teams")
        .update({ status: newStatus })
        .in("id", targetIds);

      setTeams((prev) =>
        prev.map((t) =>
          selectedIds.has(t.id) ? { ...t, status: newStatus } : t
        )
      );
      setSelectedIds(new Set());
      setConfirmAction(null);
    } catch (err) {
      console.error("Failed to update shortlist status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSingleTeamShortlist = async (team: ShortlistTeam) => {
    const newStatus = team.status === "shortlisted" ? "round1" : "shortlisted";
    try {
      await supabase.from("teams").update({ status: newStatus }).eq("id", team.id);
      setTeams((prev) =>
        prev.map((t) => (t.id === team.id ? { ...t, status: newStatus } : t))
      );
      if (reviewTeam && reviewTeam.id === team.id) {
        setReviewTeam({ ...reviewTeam, status: newStatus });
      }
    } catch (err) {
      console.error("Error updating single team status:", err);
    }
  };

  const isAllSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  // Convert URLs for embedding
  const getEmbedUrl = (rawUrl?: string) => {
    if (!rawUrl) return "";
    try {
      if (rawUrl.includes("drive.google.com/file/d/")) {
        const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
      }
      if (rawUrl.includes("docs.google.com/presentation/d/")) {
        const match = rawUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
        }
      }
      if (rawUrl.includes("canva.com/design/")) {
        return rawUrl.replace("/view", "/view?embed");
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Round 2 Shortlisting Engine
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Review participant submitted pitch decks, read solution summaries, and shortlist qualified teams for Round 2.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadTeams}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <div className="px-4 py-2 rounded-xl bg-surface-container/90 border border-outline-variant/30 text-xs font-headline font-bold text-outline">
            Total Teams: <span className="text-on-surface ml-1">{teams.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary-container/20 border border-primary/40 text-xs font-headline font-bold text-primary">
            Shortlisted: <span className="ml-1">{shortlistedCount}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search team name, code, members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-headline font-semibold text-on-surface outline-none focus:border-primary"
        >
          <option value="all">All Teams ({filtered.length})</option>
          <option value="round1">Round 1 Only</option>
          <option value="shortlisted">Shortlisted for Round 2</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-surface-container-lowest/80 text-outline uppercase font-headline font-bold tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3.5">Team Name</th>
                <th className="px-4 py-3.5">Team Code</th>
                <th className="px-4 py-3.5">Members</th>
                <th className="px-4 py-3.5">Submission Deck</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-outline">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading teams...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-outline">
                    {search || statusFilter !== "all"
                      ? "No teams match your search filters."
                      : "No teams formed in the database yet."}
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const isSelected = selectedIds.has(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleToggleSelect(t.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary-container/10 hover:bg-primary-container/15"
                          : "hover:bg-surface-container-high/40"
                      }`}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(t.id)}
                          className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-on-surface font-headline text-sm">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-outline">Lead: {t.leadName}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-primary">
                        {t.code}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-on-surface">{t.memberNames}</div>
                        <div className="text-[11px] text-outline">{t.memberCount} member(s)</div>
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setReviewTeam(t)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary transition-colors text-xs font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>Review Deck</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <Chip
                          variant={t.status === "shortlisted" ? "amber" : "neutral"}
                          pulse={t.status === "shortlisted"}
                        >
                          {t.status === "shortlisted" ? "Shortlisted" : "Round 1"}
                        </Chip>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSingleTeamShortlist(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                            t.status === "shortlisted"
                              ? "bg-error-container/30 text-error hover:bg-error-container/50"
                              : "bg-primary text-on-primary hover:bg-primary-hover shadow-sm"
                          }`}
                        >
                          {t.status === "shortlisted" ? "Remove" : "Shortlist"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-surface-container-lowest/60 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
          <div>
            Showing {paginated.length} of {filtered.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container-high"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-on-surface">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container-high"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Glass Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-200">
          <div className="p-4 rounded-2xl bg-surface-container/95 border border-primary/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-headline font-bold text-on-surface">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono">
                {selectedIds.size}
              </span>
              <span>Team(s) Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction("remove")}
              >
                Remove from Shortlist
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setConfirmAction("shortlist")}
                leftIcon={<Trophy className="w-4 h-4" />}
              >
                Shortlist for Round 2
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission & Reader Modal */}
      <Modal
        isOpen={!!reviewTeam}
        onClose={() => setReviewTeam(null)}
        title={`Review Submission: ${reviewTeam?.name || ""}`}
        maxWidth="xl"
      >
        {reviewTeam && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-on-surface font-headline">
                    {reviewTeam.name}
                  </span>
                  <span className="font-mono text-xs text-primary font-bold">
                    ({reviewTeam.code})
                  </span>
                  <Chip
                    variant={reviewTeam.status === "shortlisted" ? "amber" : "neutral"}
                    size="sm"
                  >
                    {reviewTeam.status === "shortlisted" ? "SHORTLISTED" : "ROUND 1"}
                  </Chip>
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-container/20 border border-primary/40 shrink-0">
                    {reviewTeam.problemStatementId || "PS01"}
                  </span>
                  <span className="text-xs font-headline font-semibold text-on-surface truncate">
                    {reviewTeam.problemStatementTitle || "AI Campus Study & Peer Collaborative Copilot"}
                  </span>
                </div>

                <div className="text-xs text-outline mt-1">
                  Team Members: <span className="text-on-surface">{reviewTeam.memberNames}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={reviewTeam.status === "shortlisted" ? "destructive" : "primary"}
                  size="sm"
                  onClick={() => handleToggleSingleTeamShortlist(reviewTeam)}
                  leftIcon={reviewTeam.status === "shortlisted" ? <XCircle className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                >
                  {reviewTeam.status === "shortlisted" ? "Remove from Shortlist" : "Shortlist Team"}
                </Button>
              </div>
            </div>

            {/* Embedded Document Reader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-headline font-bold text-outline">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>EMBEDDED DECK & DOCUMENT READER</span>
                </div>
                {reviewTeam.pptUrl && (
                  <a
                    href={reviewTeam.pptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Open in New Tab <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="w-full h-96 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface shadow-inner">
                <iframe
                  src={getEmbedUrl(reviewTeam.pptUrl)}
                  title="Team Deck Reader"
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Structured Submission Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="font-headline font-bold text-primary mb-1">
                  Target Users & Usability Focus
                </div>
                <p className="text-on-surface leading-relaxed">
                  {reviewTeam.targetUsers || "Not specified by team."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="font-headline font-bold text-secondary mb-1">
                  Technology Stack & Architecture
                </div>
                <p className="text-on-surface leading-relaxed">
                  {reviewTeam.techStack || "Not specified by team."}
                </p>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="font-headline font-bold text-on-surface mb-1">
                  Product Description & End-to-End User Flow
                </div>
                <p className="text-on-surface leading-relaxed">
                  {reviewTeam.shortDesc || "Not specified by team."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <Button variant="ghost" onClick={() => setReviewTeam(null)}>
                Close Reader
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === "shortlist" ? "Shortlist Teams for Round 2" : "Remove from Shortlist"}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface font-body leading-relaxed">
            {confirmAction === "shortlist" ? (
              <span>
                You are shortlisting <strong>{selectedIds.size} team(s)</strong> for Round 2.
                All members of these teams will immediately see Round 2 unlocked on their dashboard.
              </span>
            ) : (
              <span>
                You are removing <strong>{selectedIds.size} team(s)</strong> from the Round 2 shortlist.
                Round 2 will be re-locked on their member dashboards.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "shortlist" ? "primary" : "destructive"}
              isLoading={isUpdating}
              onClick={handleExecuteAction}
            >
              {confirmAction === "shortlist" ? "Confirm Shortlisting" : "Confirm Removal"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
