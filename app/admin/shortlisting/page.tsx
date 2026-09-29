"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Search,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  FileText,
  ExternalLink,
  Crown,
  Check,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Modal } from "@/components/shared/Modal";
import { Chip } from "@/components/shared/Chip";
import { getProblemStatementById } from "@/lib/problem-statements";

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
  pptUrl?: string;
  techStack?: string;
}

export default function AdminShortlistingPage() {
  const [teams, setTeams] = useState<ShortlistTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [reviewTeam, setReviewTeam] = useState<ShortlistTeam | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch via admin API (service role key — bypasses RLS)
      const response = await fetch("/api/admin/shortlist");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load teams");
        setTeams([]);
        return;
      }

      const formatted: ShortlistTeam[] = (data.teams || []).map((t: any) => {
        const membersList = (t.team_members || []).map(
          (tm: any) => tm.profiles?.full_name || "Member"
        );
        const leadMember = (t.team_members || []).find((tm: any) => tm.role === "lead");
        const ps = t.problem_statement_id
          ? getProblemStatementById(t.problem_statement_id)
          : undefined;

        return {
          id: t.id,
          name: t.name,
          code: t.code,
          leadName: leadMember?.profiles?.full_name || "Unknown",
          memberCount: membersList.length,
          memberNames: membersList.join(", ") || "No members",
          status: t.status || "round1",
          problemStatementId: t.problem_statement_id || undefined,
          problemStatementTitle: ps?.title || undefined,
          pptUrl: t.ppt_url || undefined,
          techStack: t.tech_stack || undefined,
        };
      });

      setTeams(formatted);
    } catch (err) {
      console.error("Failed to load teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
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
        t.memberNames.toLowerCase().includes(search.toLowerCase()) ||
        t.leadName.toLowerCase().includes(search.toLowerCase());

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

  const handleToggleShortlist = async (team: ShortlistTeam) => {
    const newStatus = team.status === "shortlisted" ? "round1" : "shortlisted";
    setUpdatingId(team.id);

    try {
      const response = await fetch("/api/admin/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamIds: [team.id], status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to toggle shortlist");

      // Update in-place
      setTeams((prev) =>
        prev.map((t) => (t.id === team.id ? { ...t, status: newStatus } : t))
      );
      // Also update the review modal if it's open for this team
      if (reviewTeam?.id === team.id) {
        setReviewTeam((r) => (r ? { ...r, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Error updating shortlist status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Convert submission URLs for iframe embedding
  const getEmbedUrl = (rawUrl?: string) => {
    if (!rawUrl) return "";
    try {
      if (rawUrl.includes("drive.google.com/file/d/")) {
        const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      if (rawUrl.includes("docs.google.com/presentation/d/")) {
        const match = rawUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        if (match?.[1])
          return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Round 2 Shortlisting
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Review team submissions and shortlist teams for Round 2. Changes take effect immediately.
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
            Total: <span className="text-on-surface ml-1">{teams.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-primary-container/20 border border-primary/40 text-xs font-headline font-bold text-primary">
            Shortlisted: <span className="ml-1">{shortlistedCount}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          <span className="text-xs text-error font-body">{error}</span>
        </div>
      )}

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
          <option value="all">All Teams ({teams.length})</option>
          <option value="round1">Round 1 Only</option>
          <option value="shortlisted">Shortlisted for Round 2</option>
        </select>
      </div>

      {/* Teams Table */}
      <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-surface-container-lowest/80 text-outline uppercase font-headline font-bold tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3.5">Team</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Members</th>
                <th className="px-4 py-3.5">Problem Statement</th>
                <th className="px-4 py-3.5">Submission</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Shortlist</th>
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
                      : "No teams found in the database."}
                  </td>
                </tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-on-surface font-headline text-sm">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-outline flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-primary" />
                        {t.leadName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      {t.code}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-on-surface">{t.memberNames}</div>
                      <div className="text-[11px] text-outline">{t.memberCount} member(s)</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.problemStatementId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary-container/20 border border-primary/40 shrink-0">
                            {t.problemStatementId}
                          </span>
                          <span
                            className="truncate max-w-[160px] text-xs text-on-surface"
                            title={t.problemStatementTitle}
                          >
                            {t.problemStatementTitle || "—"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-outline italic">Not selected</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {t.pptUrl ? (
                        <button
                          onClick={() => setReviewTeam(t)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary transition-colors text-xs font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span>View Deck</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-outline italic">No submission</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Chip
                        variant={t.status === "shortlisted" ? "amber" : "neutral"}
                        pulse={t.status === "shortlisted"}
                      >
                        {t.status === "shortlisted" ? "Shortlisted" : "Round 1"}
                      </Chip>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleShortlist(t)}
                        disabled={updatingId === t.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all disabled:opacity-60 ${
                          t.status === "shortlisted"
                            ? "bg-error-container/30 text-error hover:bg-error-container/50"
                            : "bg-primary text-on-primary hover:bg-primary-hover shadow-sm"
                        }`}
                      >
                        {updatingId === t.id ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ...
                          </span>
                        ) : t.status === "shortlisted" ? (
                          "Remove"
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Shortlist
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-surface-container-lowest/60 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
          <div>
            Showing {paginated.length} of {filtered.length} entries
            {filtered.length !== teams.length && ` (filtered from ${teams.length})`}
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

      {/* Deck Review Modal */}
      <Modal
        isOpen={!!reviewTeam}
        onClose={() => setReviewTeam(null)}
        title={`Submission: ${reviewTeam?.name || ""}`}
        maxWidth="xl"
      >
        {reviewTeam && (
          <div className="space-y-5">
            {/* Team Info Header */}
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
                <div className="text-xs text-outline mt-1">
                  Members: <span className="text-on-surface">{reviewTeam.memberNames}</span>
                </div>
                {reviewTeam.techStack && (
                  <div className="text-xs text-outline mt-0.5">
                    Tech Stack: <span className="text-on-surface">{reviewTeam.techStack}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleToggleShortlist(reviewTeam)}
                disabled={updatingId === reviewTeam.id}
                className={`px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all disabled:opacity-60 flex items-center gap-2 ${
                  reviewTeam.status === "shortlisted"
                    ? "bg-error-container/30 text-error hover:bg-error-container/50"
                    : "bg-primary text-on-primary hover:bg-primary-hover shadow-sm"
                }`}
              >
                {reviewTeam.status === "shortlisted" ? (
                  <>
                    <XCircle className="w-4 h-4" /> Remove from Shortlist
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" /> Shortlist for Round 2
                  </>
                )}
              </button>
            </div>

            {/* Embedded Deck Reader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-headline font-bold text-outline">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>PITCH DECK / SUBMISSION</span>
                </div>
                <a
                  href={reviewTeam.pptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
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

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <Button variant="ghost" onClick={() => setReviewTeam(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
