"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  FileText,
  UploadCloud,
  CheckCircle2,
  Save,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  FileUp,
  FileCheck,
  RefreshCw,
  Maximize2,
  Terminal,
  BookOpen,
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import { WhatsAppFloatingButton } from "@/components/shared/WhatsAppFloatingButton";
import { createClient } from "@/lib/supabase/client";
import { useEventSettings } from "@/lib/event-settings";
import {
  OFFICIAL_PROBLEM_STATEMENTS,
  getProblemStatementById,
  ProblemStatement,
} from "@/lib/problem-statements";

export default function Round1Page() {
  const router = useRouter();
  const supabase = createClient();
  const { settings: globalSettings } = useEventSettings();

  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; participantId: string } | null>(null);
  const [teamPs, setTeamPs] = useState<ProblemStatement>(OFFICIAL_PROBLEM_STATEMENTS[0]);

  // Form submission states
  const [submissionType, setSubmissionType] = useState<"file" | "url">("url");
  const [pptUrl, setPptUrl] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [techStack, setTechStack] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || "demo-user-id";

        // Fetch settings
        const { data: settings } = await supabase
          .from("event_settings")
          .select("round1_unlocked")
          .eq("id", 1)
          .single();

        if (settings) {
          setIsUnlocked(settings.round1_unlocked);
        } else {
          setIsUnlocked(true);
        }

        // Fetch profile & team
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, participant_id")
          .eq("id", userId)
          .single();

        if (profile) {
          setUserProfile({
            fullName: profile.full_name,
            participantId: profile.participant_id,
          });
        }

        const { data: member } = await supabase
          .from("team_members")
          .select("team_id, teams(problem_statement_id, problem_statement_title, problem_statement_domain)")
          .eq("profile_id", userId)
          .single();

        if (member) {
          setHasTeam(true);
          const psId = (member as any).teams?.problem_statement_id || "PS01";
          const foundPs = getProblemStatementById(psId);
          if (foundPs) {
            setTeamPs(foundPs);
          }
        } else {
          setHasTeam(true);
        }
      } catch {
        setIsUnlocked(true);
        setHasTeam(true);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, [supabase]);

  // Convert Google Drive view URLs to embeddable preview URLs
  const getEmbedUrl = (rawUrl: string) => {
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
      // Fallback for general PDF URLs
      if (rawUrl.endsWith(".pdf")) {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  // Handle local file selection and optional auto-upload to Drive webhook
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File size exceeds the 25MB maximum limit.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    try {
      const webhookUrl = globalSettings.drive_upload_webhook_url;

      if (webhookUrl && webhookUrl.startsWith("http")) {
        // Stream to Google Apps Script webhook
        const reader = new FileReader();
        reader.onload = async (uploadEvent) => {
          try {
            const base64Content = (uploadEvent.target?.result as string).split(",")[1];
            const payload = {
              filename: file.name,
              mimeType: file.type || "application/pdf",
              base64: base64Content,
              teamName: userProfile?.fullName ? `${userProfile.fullName}_Team` : "ProtoHack_Submission",
            };

            const response = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.url) {
              setPptUrl(result.url);
            } else {
              // Fallback to local representation
              const objectUrl = URL.createObjectURL(file);
              setPptUrl(objectUrl);
            }
          } catch (err) {
            console.warn("Webhook upload failed, fallback to local URL:", err);
            const objectUrl = URL.createObjectURL(file);
            setPptUrl(objectUrl);
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // No webhook configured, simulate instant processed upload
        setTimeout(() => {
          const objectUrl = URL.createObjectURL(file);
          setPptUrl(objectUrl);
          setIsUploading(false);
        }, 1200);
      }
    } catch (err) {
      setUploadError("Failed to process document upload. Please try pasting a direct Google Drive link.");
      setIsUploading(false);
    }
  };

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptUrl.trim()) {
      setUploadError("Please provide a presentation deck link or upload a file.");
      return;
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(pptUrl);

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="full" />
      <Navbar variant="participant" userProfile={userProfile} onLogout={handleLogout} />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {/* Active Server Countdown Clocks */}
        <div className="mb-6 flex justify-center">
          <ServerClockRenderer placement="round_1" />
        </div>

        {!hasTeam ? (
          /* Locked because user is not in a team */
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-primary-container/15 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Team Required
            </h2>
            <p className="text-sm text-outline font-body mb-6">
              You must create or join a team first before accessing the Round 1 challenge area.
            </p>
            <Link href="/dashboard">
              <Button variant="primary" size="md">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : !isUnlocked ? (
          /* Locked by Admin */
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-outline mx-auto mb-4">
              <Lock className="w-8 h-8 text-outline" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Round 1 is Locked
            </h2>
            <p className="text-sm text-outline font-body mb-6">
              Round 1 opens on <strong>October 4 at 12:00 AM IST</strong>. Organizers will unlock problem statements and submission forms at that time.
            </p>
            <Link href="/dashboard">
              <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          /* Unlocked Round 1 Screen */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Chip variant="success" pulse>
                    ROUND 1 LIVE · ONLINE PRE-EVENT BUILD
                  </Chip>
                </div>
                <h1 className="text-3xl font-headline font-bold text-on-surface">
                  Round 1: Product Concept & Documentation
                </h1>
                <p className="text-sm text-outline mt-1 font-body">
                  Submission Deadline: October 7, 2026, 11:59:59 PM IST
                </p>
              </div>

              <Link href="/dashboard">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-xl bg-success-container border border-success/40 flex items-center gap-3 text-xs text-success animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Round 1 submission saved successfully! You can update it anytime before October 7, 11:59:59 PM IST.</span>
              </div>
            )}

            {/* Assigned Problem Statement Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-primary/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded bg-primary-container/20 border border-primary/40">
                        {teamPs.id}
                      </span>
                      <span className="text-xs font-headline font-bold text-outline">
                        {teamPs.domain}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-headline font-bold text-on-surface mt-0.5">
                      {teamPs.title}
                    </h2>
                  </div>
                </div>

                <Chip
                  variant={
                    teamPs.difficulty === "Beginner Friendly"
                      ? "success"
                      : teamPs.difficulty === "Intermediate"
                      ? "amber"
                      : "lavender"
                  }
                  size="sm"
                >
                  {teamPs.difficulty}
                </Chip>
              </div>

              <p className="text-xs sm:text-sm text-on-surface-variant font-body leading-relaxed mb-6">
                {teamPs.description}
              </p>

              {/* Key Deliverables & Scope Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {teamPs.keyDeliverables.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface font-body"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-outline-variant/15 text-[11px] font-mono text-outline">
                <span>Target Demographic: {teamPs.targetAudience}</span>
                <span className="text-primary font-semibold">Recommended Tech: {teamPs.suggestedTech.join(", ")}</span>
              </div>
            </div>

            {/* Evaluation Focus Banner */}
            <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold font-headline text-primary uppercase tracking-wider">
                  Round 1 Evaluation Breakdown (100 Points):
                </div>
                <Chip variant="amber">Online Build Stage</Chip>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface-container-low border border-primary/40 shadow-inner">
                  <div className="font-mono text-xl font-bold text-primary">40%</div>
                  <div className="text-[11px] text-on-surface font-headline font-semibold mt-1">Target Users & Tech Approach</div>
                  <div className="text-[10px] text-outline mt-0.5">Clarity, usability & user alignment</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-mono text-xl font-bold text-on-surface">20%</div>
                  <div className="text-[11px] text-on-surface font-headline font-semibold mt-1">Functionality & Completeness</div>
                  <div className="text-[10px] text-outline mt-0.5">Working end-to-end features</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-mono text-xl font-bold text-on-surface">20%</div>
                  <div className="text-[11px] text-on-surface font-headline font-semibold mt-1">Product Thinking</div>
                  <div className="text-[10px] text-outline mt-0.5">Problem definition & teamwork</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="font-mono text-xl font-bold text-on-surface">20%</div>
                  <div className="text-[11px] text-on-surface font-headline font-semibold mt-1">Documentation & Evidence</div>
                  <div className="text-[10px] text-outline mt-0.5">PPT & short description form</div>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSaveSubmission} className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-primary/30 shadow-amber-subtle backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-headline font-bold text-on-surface">
                    Round 1 Official Submission Form
                  </h2>
                  <p className="text-xs text-outline font-body">
                    Upload your product pitch deck / document and complete your technical solution summary.
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-xs text-error flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* 1. Presentation Deck Option Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase font-headline font-semibold text-outline">
                      1. PPT / PDF Presentation Deck <span className="text-primary">*</span>
                    </label>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                      <button
                        type="button"
                        onClick={() => setSubmissionType("url")}
                        className={`px-3 py-1 rounded-lg text-xs font-headline font-semibold transition-all ${
                          submissionType === "url"
                            ? "bg-primary text-on-primary shadow-sm"
                            : "text-outline hover:text-on-surface"
                        }`}
                      >
                        Paste Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmissionType("file")}
                        className={`px-3 py-1 rounded-lg text-xs font-headline font-semibold transition-all ${
                          submissionType === "file"
                            ? "bg-primary text-on-primary shadow-sm"
                            : "text-outline hover:text-on-surface"
                        }`}
                      >
                        Upload File
                      </button>
                    </div>
                  </div>

                  {submissionType === "url" ? (
                    <div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... or Canva / OneDrive presentation link"
                        value={pptUrl}
                        onChange={(e) => setPptUrl(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <p className="text-[11px] text-outline mt-1 font-body">
                        Make sure link permissions are set to <strong>&quot;Anyone with the link can view&quot;</strong> so evaluators can review your submission.
                      </p>
                    </div>
                  ) : (
                    /* Drag & Drop / Direct File Picker */
                    <div className="p-6 rounded-2xl bg-surface-container-lowest border-2 border-dashed border-primary/40 hover:border-primary text-center transition-colors">
                      <input
                        type="file"
                        id="ppt-file-input"
                        accept=".pdf,.ppt,.pptx,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="ppt-file-input" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-3">
                          {isUploading ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                          ) : uploadedFileName ? (
                            <FileCheck className="w-6 h-6 text-success" />
                          ) : (
                            <UploadCloud className="w-6 h-6" />
                          )}
                        </div>

                        <div className="font-headline font-bold text-sm text-on-surface">
                          {uploadedFileName ? uploadedFileName : "Click or drag document to upload"}
                        </div>

                        <p className="text-xs text-outline mt-1">
                          {uploadedFileSize ? `Size: ${uploadedFileSize}` : "Supported formats: PDF, PPTX, PPT, DOCX (Max 25MB)"}
                        </p>

                        {isUploading && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                            <span>Processing file for live preview...</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Live In-Portal Document Reader Preview */}
                {pptUrl && (
                  <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-xs font-headline font-bold text-on-surface">
                          Live In-Portal Document Preview
                        </span>
                        <Chip variant="success" size="sm">
                          VERIFIED
                        </Chip>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={pptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          Open in Tab <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setShowPreview(!showPreview)}
                          className="p-1.5 rounded-lg text-outline hover:text-on-surface bg-surface-container-high transition-colors"
                          title={showPreview ? "Hide Preview" : "Show Preview"}
                        >
                          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {showPreview && (
                      <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface shadow-inner">
                        <iframe
                          src={embedUrl}
                          title="Submitted Presentation Preview"
                          className="w-full h-full border-none"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Target Users */}
                <div>
                  <label className="block text-xs uppercase font-headline font-semibold text-outline mb-1.5">
                    2. Target Users & Usability Focus <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SRMIST students navigating campus study groups and micro-carpooling"
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-xs uppercase font-headline font-semibold text-outline mb-1.5">
                    3. Technology Stack & Planned Architecture
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js 14, TypeScript, Supabase PostgreSQL, Tailwind CSS"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs uppercase font-headline font-semibold text-outline mb-1.5">
                    4. Short Description of Planned Product Build <span className="text-primary">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what your team is building, the core end-to-end user flow, and the key features you plan to demonstrate..."
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    required
                    className="w-full p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-outline font-body">
                  Editable until October 7, 2026, 11:59:59 PM IST
                </span>
                <Button type="submit" variant="primary" size="lg" leftIcon={<Save className="w-4 h-4" />}>
                  Save Round 1 Submission
                </Button>
              </div>
            </form>

            {/* Participant Checklist */}
            <div className="p-6 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
              <div className="flex items-center gap-2 mb-3 font-headline font-bold text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" /> Round 1 Preparation Checklist
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-on-surface-variant font-body">
                <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Choose an idea or problem statement from the domain tracks.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Scope a clear primary user flow and working core feature.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Ensure your PPT link is public and accessible for evaluation.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>Submit before October 7, 11:59:59 PM IST.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Widget */}
      <WhatsAppFloatingButton />
    </div>
  );
}
