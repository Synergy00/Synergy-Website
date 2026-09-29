"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Modal } from "@/components/shared/Modal";
import { Chip } from "@/components/shared/Chip";


interface ParticipantRecord {
  id: string;
  participantId: string;
  fullName: string;
  regNo: string;
  college: string;
  branch: string;
  department: string;
  section: string;
  contact: string;
  email: string;
  teamName: string | null;
  teamRole: "lead" | "member" | null;
  createdAt: string;
}

export default function AdminParticipantsPage() {

  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [toDelete, setToDelete] = useState<ParticipantRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load real participants via Admin API (Bypasses RLS)
  const loadParticipants = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/participants");
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Failed to fetch profiles:", data.error);
        setParticipants([]);
        return;
      }

      if (data.profiles) {
        const formatted: ParticipantRecord[] = data.profiles.map((p: any) => {
          const membership = Array.isArray(p.team_members) ? p.team_members[0] : p.team_members;
          return {
            id: p.id,
            participantId: p.participant_id,
            fullName: p.full_name,
            regNo: p.reg_no,
            college: p.college,
            branch: p.branch,
            department: p.department,
            section: p.section,
            contact: p.contact,
            email: p.email,
            teamName: membership?.teams?.name || null,
            teamRole: membership?.role || null,
            createdAt: p.created_at
              ? new Date(p.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              : "",
          };
        });
        setParticipants(formatted);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      console.error("Exception loading participants:", err);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  // Filtered & Searched data
  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.participantId.toLowerCase().includes(search.toLowerCase()) ||
        p.regNo.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.college.toLowerCase().includes(search.toLowerCase());

      const matchesCollege =
        collegeFilter === "all" || p.college.toLowerCase().includes(collegeFilter.toLowerCase());

      const matchesTeam =
        teamFilter === "all" ||
        (teamFilter === "in_team" && p.teamName !== null) ||
        (teamFilter === "no_team" && p.teamName === null);

      return matchesSearch && matchesCollege && matchesTeam;
    });
  }, [participants, search, collegeFilter, teamFilter]);

  // Unique colleges for filter dropdown
  const collegesList = useMemo(() => {
    const set = new Set(participants.map((p) => p.college).filter(Boolean));
    return Array.from(set);
  }, [participants]);

  // Pagination slice
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Stats calculation
  const totalCount = participants.length;
  const inTeamCount = participants.filter((p) => p.teamName !== null).length;
  const noTeamCount = totalCount - inTeamCount;

  // CSV Export
  const exportCsv = () => {
    const headers = [
      "Participant ID",
      "Full Name",
      "Reg No",
      "College",
      "Branch",
      "Department",
      "Section",
      "Contact",
      "Email",
      "Team Name",
      "Role",
    ];
    const rows = filtered.map((p) => [
      p.participantId,
      `"${p.fullName}"`,
      p.regNo,
      `"${p.college}"`,
      p.branch,
      p.department,
      p.section,
      p.contact,
      p.email,
      p.teamName ? `"${p.teamName}"` : "None",
      p.teamRole || "None",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `protohack_participants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Safe Removal logic via Admin API (Hard Delete from Supabase Auth)
  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/users/${toDelete.id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete user.");
        return;
      }
      
      setParticipants((prev) => prev.filter((p) => p.id !== toDelete.id));
      setToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete participant.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Participant Directory
          </h1>
          <p className="text-xs text-outline font-body mt-0.5">
            Real-time live database records of all registered students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadParticipants}
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

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            Total Registered
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-primary mt-1">
            {totalCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            In a Team
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-success mt-1">
            {inTeamCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
          <div className="text-xs uppercase font-headline font-bold text-outline">
            Without a Team
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-secondary mt-1">
            {noTeamCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search name, ID, Reg No, college, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-headline font-semibold text-on-surface outline-none focus:border-primary"
          >
            <option value="all">All Team Status</option>
            <option value="in_team">In a Team</option>
            <option value="no_team">No Team</option>
          </select>

          {/* Dynamic College Filter */}
          <select
            value={collegeFilter}
            onChange={(e) => {
              setCollegeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-headline font-semibold text-on-surface outline-none focus:border-primary"
          >
            <option value="all">All Colleges</option>
            {collegesList.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="rounded-2xl bg-surface-container/90 border border-outline-variant/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-surface-container-lowest/80 text-outline uppercase font-headline font-bold tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Participant</th>
                <th className="px-4 py-3.5">Reg No</th>
                <th className="px-4 py-3.5">College & Dept</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Team</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-outline">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading real-time database records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-outline">
                    {search || collegeFilter !== "all" || teamFilter !== "all"
                      ? "No participants match your current search filters."
                      : "No registered participants in the database yet. New registrations on the website will appear here automatically."}
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container-high/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-primary">
                      {p.participantId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-on-surface font-headline">
                        {p.fullName}
                      </div>
                      <div className="text-[11px] text-outline">{p.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-on-surface-variant">
                      {p.regNo}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-on-surface truncate max-w-[180px]">
                        {p.college}
                      </div>
                      <div className="text-[11px] text-outline">
                        {p.branch} · {p.section}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-on-surface-variant">
                      {p.contact}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.teamName ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary-container/15 text-primary border border-primary/30 text-[11px] font-headline font-semibold">
                          {p.teamName} {p.teamRole === "lead" && "★"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-outline italic">No Team</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setToDelete(p)}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
                        title="Remove participant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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

      {/* Removal Confirm Dialog */}
      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Remove Participant"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="text-xs text-error font-body">
              Are you sure you want to remove <strong>{toDelete?.fullName}</strong> ({toDelete?.participantId})?
              Their registration and account will be deleted from Supabase.
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
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
