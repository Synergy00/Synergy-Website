"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crown,
  Copy,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Modal } from "@/components/shared/Modal";
import { Chip } from "@/components/shared/Chip";
import { createClient } from "@/lib/supabase/client";

interface TeamMember {
  id: string;
  fullName: string;
  participantId: string;
  college: string;
  role: "lead" | "member";
}

interface TeamRecord {
  id: string;
  name: string;
  code: string;
  leadName: string;
  status: "round1" | "shortlisted";
  problemStatementId?: string;
  problemStatementTitle?: string;
  problemStatementDomain?: string;
  members: TeamMember[];
  createdAt: string;
}

export default function AdminTeamsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TeamRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
          created_at,
          lead_id,
          problem_statement_id,
          problem_statement_title,
          problem_statement_domain,
          team_members (
            role,
            profiles (
              id,
              full_name,
              participant_id,
              college
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (teamsData && !error) {
        const formatted: TeamRecord[] = teamsData.map((t: any) => {
          const membersList: TeamMember[] = (t.team_members || []).map((tm: any) => ({
            id: tm.profiles?.id || "",
            fullName: tm.profiles?.full_name || "Member",
            participantId: tm.profiles?.participant_id || "PH26-00-0000",
            college: tm.profiles?.college || "College",
            role: tm.role || "member",
          }));

          const lead = membersList.find((m) => m.role === "lead");

          return {
            id: t.id,
            name: t.name,
            code: t.code,
            leadName: lead?.fullName || "Lead",
            status: t.status || "round1",
            problemStatementId: t.problem_statement_id || "PS01",
            problemStatementTitle: t.problem_statement_title || "AI Campus Study & Peer Collaborative Copilot",
            problemStatementDomain: t.problem_statement_domain || "AI & Intelligent Systems",
            members: membersList,
            createdAt: t.created_at,
          };
        });

        setTeams(formatted);
      } else {
        // Fallback demo data
        setTeams([
          {
            id: "team-1",
            name: "ByteShift",
            code: "PHT01-DWFW",
            leadName: "Alex Chen",
            status: "shortlisted",
            createdAt: new Date().toISOString(),
            members: [
              {
                id: "1",
                fullName: "Alex Chen",
                participantId: "PH26-01-0012",
                college: "MIT",
                role: "lead",
              },
              {
                id: "2",
                fullName: "Sarah Jenkins",
                participantId: "PH26-01-0045",
                college: "MIT",
                role: "member",
              },
              {
                id: "3",
                fullName: "Devon Vance",
                participantId: "PH26-01-0089",
                college: "Stanford",
                role: "member",
              },
            ],
          },
          {
            id: "team-2",
            name: "NeuralFlow",
            code: "PHT02-K92X",
            leadName: "Maya Lin",
            status: "round1",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            members: [
              {
                id: "4",
                fullName: "Maya Lin",
                participantId: "PH26-01-0021",
                college: "Berkeley",
                role: "lead",
              },
              {
                id: "5",
                fullName: "Rohan Patel",
                participantId: "PH26-01-0077",
                college: "Berkeley",
                role: "member",
              },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);

    try {
      await supabase.from("team_members").delete().eq("team_id", toDelete.id);
      await supabase.from("teams").delete().eq("id", toDelete.id);

      setTeams((prev) => prev.filter((t) => t.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      console.error("Failed to disband team:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.leadName.toLowerCase().includes(search.toLowerCase()) ||
      t.members.some((m) =>
        m.fullName.toLowerCase().includes(search.toLowerCase()) ||
        m.participantId.toLowerCase().includes(search.toLowerCase())
      );

    const matchesSize =
      sizeFilter === "all"
        ? true
        : sizeFilter === "3"
        ? t.members.length === 3
        : t.members.length < 3;

    const matchesStatus =
      statusFilter === "all" ? true : t.status === statusFilter;

    return matchesSearch && matchesSize && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalTeams = teams.length;
  const fullTeams = teams.filter((t) => t.members.length === 3).length;
  const incompleteTeams = teams.filter((t) => t.members.length < 3).length;

  const exportCsv = () => {
    const headers = [
      "Team ID",
      "Team Name",
      "Team Code",
      "Status",
      "Created At",
      "Members Count",
      "Members List",
    ];

    const rows = filtered.map((t) => [
      t.id,
      `"${t.name}"`,
      t.code,
      t.status,
      t.createdAt,
      t.members.length,
      `"${t.members.map((m) => `${m.fullName} (${m.participantId}, ${m.role})`).join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `protohack_teams_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Teams Management
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Real-time live team formations and member rosters from Supabase.
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

          <Button
            variant="secondary"
            size="sm"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV ({filtered.length})
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            Total Teams
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-primary mt-1">
            {totalTeams}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            Full Teams (3/3)
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-success mt-1">
            {fullTeams}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            Incomplete Teams (1–2)
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-secondary mt-1">
            {incompleteTeams}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search team name, code, member..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={sizeFilter}
            onChange={(e) => {
              setSizeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-headline font-semibold text-on-surface outline-none focus:border-primary"
          >
            <option value="all">All Sizes</option>
            <option value="3">Full Teams (3/3)</option>
            <option value="1-2">Incomplete (1–2)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-headline font-semibold text-on-surface outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="round1">Round 1</option>
            <option value="shortlisted">Shortlisted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-surface-container-lowest/80 text-outline uppercase font-headline font-bold tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3.5">Team Name</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Team Lead</th>
                <th className="px-4 py-3.5">Problem Statement</th>
                <th className="px-4 py-3.5">Capacity</th>
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
                      <span>Loading real-time teams...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-outline">
                    {search || sizeFilter !== "all" || statusFilter !== "all"
                      ? "No teams match your current filters."
                      : "No teams formed in the database yet. When participants create teams, they will appear here live."}
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const isExpanded = expandedTeamId === t.id;
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-on-surface font-headline text-sm">
                            {t.name}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant font-mono font-bold text-primary">
                            <span>{t.code}</span>
                            <button
                              onClick={() => copyCode(t.code)}
                              className="hover:text-on-surface text-outline transition-colors"
                              title="Copy Code"
                            >
                              {copiedCode === t.code ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-on-surface">
                            {t.leadName}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-container/20 border border-primary/40 shrink-0">
                              {t.problemStatementId || "PS01"}
                            </span>
                            <span className="truncate max-w-[180px] text-xs font-medium text-on-surface" title={t.problemStatementTitle}>
                              {t.problemStatementTitle || "AI Campus Study & Peer Collaborative Copilot"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                              t.members.length === 3
                                ? "bg-success-container text-success"
                                : "bg-primary-container/20 text-primary"
                            }`}
                          >
                            {t.members.length} / 3
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Chip
                            variant={t.status === "shortlisted" ? "amber" : "neutral"}
                            size="sm"
                          >
                            {t.status === "shortlisted" ? "Shortlisted" : "Round 1"}
                          </Chip>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setExpandedTeamId(isExpanded ? null : t.id)
                              }
                              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${
                                isExpanded
                                  ? "bg-primary-container/20 border-primary text-primary"
                                  : "border-outline-variant/30 text-outline hover:text-on-surface hover:bg-surface-container-high"
                              }`}
                              title="View Members"
                            >
                              <Eye className="w-4 h-4" />
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            <button
                              onClick={() => setToDelete(t)}
                              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                              title="Disband team"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Member Details Row */}
                      {isExpanded && (
                        <tr className="bg-surface-container-lowest/50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="text-xs uppercase font-headline font-bold text-outline mb-2">
                              Team Members Roster:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {t.members.map((m) => (
                                <div
                                  key={m.id}
                                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-bold text-on-surface font-headline flex items-center gap-1.5">
                                      <span>{m.fullName}</span>
                                      {m.role === "lead" && (
                                        <Crown className="w-3.5 h-3.5 text-primary fill-primary" />
                                      )}
                                    </div>
                                    <div className="text-[11px] font-mono text-primary">
                                      {m.participantId}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-outline">
                                    {m.college}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-surface-container-lowest/60 border-t border-outline-variant/20 flex items-center justify-between text-xs text-outline">
          <div>
            Showing {paginated.length} of {filtered.length} teams
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

      {/* Disband Team Modal */}
      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Disband Team"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="text-xs text-error font-body">
              Are you sure you want to disband <strong>{toDelete?.name}</strong>?
              The team and its code will be removed from Supabase. All members will be freed to create or join a new team.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Confirm Disband
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
