"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Link as LinkIcon, CheckCircle2, UploadCloud } from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import { createClient } from "@/lib/supabase/client";

export default function Round1Page() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; participantId: string } | null>(null);

  const [pptUrl, setPptUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth");
          return;
        }

        const { data: settings } = await supabase
          .from("event_settings")
          .select("round1_unlocked")
          .eq("id", 1)
          .single();

        setIsUnlocked(settings?.round1_unlocked ?? false);

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, participant_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile({
            fullName: profile.full_name,
            participantId: profile.participant_id,
          });
        }

        const { data: member } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("profile_id", user.id)
          .maybeSingle();

        setHasTeam(!!member);
      } catch (err) {
        console.error("Access error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, [router, supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptUrl.trim() || !pptUrl.includes("http")) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }, 1200);
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

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="full" />
      <Navbar variant="participant" userProfile={userProfile} onLogout={handleLogout} />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
        <div className="mb-6 flex justify-center">
          <ServerClockRenderer placement="round_1" />
        </div>

        {!hasTeam ? (
          <div className="p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <Lock className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Team Required</h2>
            <p className="text-sm text-outline font-body mb-6">Create or join a team first.</p>
            <Link href="/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
          </div>
        ) : !isUnlocked ? (
          <div className="p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30 text-center backdrop-blur-xl">
            <Lock className="w-8 h-8 text-outline mx-auto mb-4" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Round 1 is Locked</h2>
            <p className="text-sm text-outline font-body mb-6">Round 1 opens on October 4.</p>
            <Link href="/dashboard">
              <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-outline hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              BACK TO DASHBOARD
            </Link>

            {saveSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-success-container border border-success/40 flex items-center gap-3 text-xs text-success animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Presentation link submitted successfully! Your team lead can update this link anytime before the deadline.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-surface-container/90 border border-primary/30 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/20">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-headline font-bold text-on-surface">Submit Presentation</h1>
                <p className="text-sm text-outline mt-2 max-w-md">
                  Please provide the Google Drive link to your Round 1 pitch deck. Ensure the link access is set to "Anyone with the link can view".
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase font-headline font-bold text-outline">
                  Google Drive URL <span className="text-primary">*</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/presentation/d/..."
                  value={pptUrl}
                  onChange={(e) => setPptUrl(e.target.value)}
                  required
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!pptUrl.trim()}
              >
                Submit Link
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
