
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Send, FileText, CheckCircle2, AlertCircle, Terminal } from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { createClient } from "@/lib/supabase/client";
import { getProblemStatementById, ProblemStatement } from "@/lib/problem-statements";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";

export default function Round1Page() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [round1Unlocked, setRound1Unlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; participantId: string } | null>(null);
  const [team, setTeam] = useState<any>(null);
  const [activePs, setActivePs] = useState<ProblemStatement | null>(null);
  
  const [pptUrl, setPptUrl] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    async function initRound1() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data: settings } = await supabase.from("event_settings").select("round1_unlocked").eq("id", 1).single();
        setRound1Unlocked(settings?.round1_unlocked || false);

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setUserProfile({ fullName: profile.full_name, participantId: profile.participant_id });
        }

        const { data: membership } = await supabase.from("team_members").select("team_id").eq("user_id", user.id).maybeSingle();
        
        if (membership) {
          const { data: teamData } = await supabase.from("teams").select("*").eq("id", membership.team_id).single();
          setTeam(teamData);
          if (teamData?.problem_statement_id) {
            setActivePs(getProblemStatementById(teamData.problem_statement_id) || null);
            setPptUrl(teamData.ppt_url || "");
            setGithubLink(teamData.tech_stack || "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initRound1();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ppt_url: pptUrl, github_link: githubLink })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="full" />
      <Navbar variant="participant" userProfile={userProfile} onLogout={handleLogout} />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {!round1Unlocked ? (
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 border border-secondary/30 flex items-center justify-center text-secondary mx-auto mb-4">
              <Lock className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Round 1 is Locked</h2>
            <p className="text-sm text-outline font-body mb-6">Round 1 will begin shortly. Keep an eye on the dashboard timer.</p>
            <Link href="/dashboard"><Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Dashboard</Button></Link>
          </div>
        ) : !team ? (
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <h2 className="text-2xl font-headline font-bold text-error mb-2">No Team Found</h2>
            <p className="text-sm text-outline font-body mb-6">You must create or join a team before participating in Round 1.</p>
            <Link href="/dashboard"><Button variant="primary" size="md">Go to Dashboard</Button></Link>
          </div>
        ) : !activePs ? (
          <div className="max-w-md mx-auto p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <h2 className="text-2xl font-headline font-bold text-error mb-2">Problem Statement Missing</h2>
            <p className="text-sm text-outline font-body mb-6">Your team must select a problem statement from the dashboard first.</p>
            <Link href="/dashboard"><Button variant="primary" size="md">Select Problem Statement</Button></Link>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">Round 1: Build Sprint</h1>
                <p className="text-sm text-outline font-body mt-2">Submit your documentation and codebase before the deadline.</p>
              </div>
              <ServerClockRenderer placement="round_1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
                  <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Your Problem Statement</h2>
                  <div className="p-5 rounded-xl border border-primary/30 bg-primary-container/10">
                    <div className="text-xs font-headline font-bold tracking-widest text-primary mb-2 uppercase">{activePs.domain}</div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">{activePs.title}</h3>
                    <p className="text-sm text-outline mb-4">{activePs.description}</p>
                    <div className="text-xs font-bold text-on-surface mb-2">Key Deliverables:</div>
                    <ul className="list-disc pl-4 text-xs text-outline space-y-1">
                      {activePs.keyDeliverables.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 backdrop-blur-xl">
                  <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Rules & Requirements</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <p className="text-sm text-outline">Submit a comprehensive presentation (PPT/PDF) explaining your solution architecture, UI flow, and business logic.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <p className="text-sm text-outline">Provide a link to your public GitHub repository containing the source code for your prototype.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <p className="text-sm text-outline">Submissions made after the deadline will not be evaluated.</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="p-6 rounded-2xl bg-surface-container/90 border border-primary/30 shadow-lg shadow-primary/5 backdrop-blur-xl sticky top-24">
                  <h2 className="text-xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" /> Submission Portal
                  </h2>
                  <p className="text-xs text-outline mb-6">Update your submission links as many times as you want before the deadline.</p>
                  
                  {submitSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Submission saved successfully!
                    </div>
                  )}

                  {submitError && (
                    <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Presentation Link (Google Drive / Canva)"
                      leftIcon={<FileText className="w-4 h-4" />}
                      placeholder="https://..."
                      value={pptUrl}
                      onChange={(e) => setPptUrl(e.target.value)}
                      required
                    />
                    <Input
                      label="GitHub Repository Link"
                      leftIcon={<Terminal className="w-4 h-4" />}
                      placeholder="https://github.com/..."
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full mt-4"
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : pptUrl ? "Update Submission" : "Submit"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

