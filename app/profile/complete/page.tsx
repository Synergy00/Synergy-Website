"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Hash,
  School,
  BookOpen,
  Building,
  Grid,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Navbar } from "@/components/shared/Navbar";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { formatParticipantId } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    regNo: "",
    college: "",
    yearOfStudy: "1",
    branch: "",
    department: "",
    section: "",
    contact: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUserEmail("student@university.edu");
        setUserId("00000000-0000-0000-0000-000000000001");
        return;
      }
      setUserEmail(session.user.email || "");
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("participant_id")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        router.push("/dashboard");
      }
    }
    loadUser();
  }, [router, supabase]);

  const handleChange = (field: string, value: string) => {
    let processedValue = value;

    // Real-time strict validation & formatting
    if (field === "contact") {
      // Only allow digits, max 10 characters
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (["regNo", "branch", "department", "section"].includes(field)) {
      // Auto-uppercase these fields
      processedValue = value.toUpperCase();
    } else if (field === "fullName") {
      // Prevent numbers and special characters (allow only letters, spaces, hyphens, and apostrophes)
      processedValue = value.replace(/[^A-Za-z\s\-']/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});
    setLoading(true);

    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.regNo.trim()) newErrors.regNo = "Registration number is required";
    if (!formData.college.trim()) newErrors.college = "College name is required";
    if (!formData.branch.trim()) newErrors.branch = "Branch is required (e.g. CSE)";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.section.trim()) newErrors.section = "Section is required (e.g. A, 1)";
    if (!/^[6-9]\d{9}$/.test(formData.contact.trim())) {
      newErrors.contact = "Enter a valid 10-digit phone number (starts with 6-9)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const targetId = userId || "00000000-0000-0000-0000-000000000001";
      
      // Calculate order sequence count
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const nextOrder = (count || 0) + 1;
      const customId = formatParticipantId(formData.yearOfStudy, nextOrder);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: targetId,
          participant_id: customId,
          full_name: formData.fullName.trim(),
          reg_no: formData.regNo.trim().toUpperCase(),
          college: formData.college.trim(),
          branch: formData.branch.trim().toUpperCase(),
          department: formData.department.trim().toUpperCase(),
          section: formData.section.trim().toUpperCase(),
          contact: `+91 ${formData.contact.trim()}`,
          email: userEmail,
        })
        .select("participant_id")
        .single();

      if (error) {
        if (error.message.includes("unique") || error.message.includes("reg_no")) {
          setGlobalError("This Registration Number has already been registered. Please check and try again.");
        } else {
          setGlobalError(`Database error: ${error.message}`);
          return;
        }
      } else if (data) {
        setSuccessId(data.participant_id);
      }
    } catch (err: any) {
      setGlobalError(err?.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const copyParticipantId = () => {
    if (successId) {
      navigator.clipboard.writeText(successId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="full" />
      <Navbar variant="landing" onLogout={handleLogout} />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
        {/* Success Modal / State */}
        {successId ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-surface-container/95 border border-primary/40 shadow-2xl backdrop-blur-xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mx-auto mb-6 shadow-amber">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">
              You&apos;re Registered! 🎉
            </h2>
            <p className="text-sm text-outline font-body mb-8 max-w-md mx-auto">
              Here is your official Participant ID:
            </p>

            {/* Glowing ID Display */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-primary/60 shadow-inner max-w-md mx-auto mb-8 flex items-center justify-between gap-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-primary tracking-widest">
                {successId}
              </div>
              <button
                type="button"
                onClick={copyParticipantId}
                className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant hover:border-primary text-primary transition-all"
                title="Copy Participant ID"
              >
                {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard")}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          /* Profile Form */
          <div className="p-6 sm:p-10 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
                STEP 2 OF 3 · ELIGIBILITY VERIFICATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mt-1">
                Complete Your Profile
              </h1>
              <p className="text-xs sm:text-sm text-outline mt-1 font-body">
                Please enter your academic details to receive your customized Participant ID.
              </p>
            </div>

            {globalError && (
              <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/40 flex items-center gap-3 text-xs sm:text-sm text-error">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Full Name */}
                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Chen"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  error={errors.fullName}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />

                {/* 2. Registration Number */}
                <Input
                  label="Registration Number"
                  placeholder="e.g. RA2311003010123"
                  value={formData.regNo}
                  onChange={(e) => handleChange("regNo", e.target.value)}
                  error={errors.regNo}
                  required
                  leftIcon={<Hash className="w-4 h-4" />}
                  helperText="Must match your college ID"
                />

                {/* 3. College Name */}
                <Input
                  label="College / University"
                  placeholder="e.g. SRM Institute of Science & Technology"
                  value={formData.college}
                  onChange={(e) => handleChange("college", e.target.value)}
                  error={errors.college}
                  required
                  leftIcon={<School className="w-4 h-4" />}
                />

                {/* 4. Year of Study */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-outline">
                    Year of Study <span className="text-primary">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-outline pointer-events-none flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.yearOfStudy}
                      onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm cursor-pointer"
                    >
                      <option value="1">1st Year (01)</option>
                      <option value="2">2nd Year (02)</option>
                      <option value="3">3rd Year (03)</option>
                      <option value="4">4th Year (04)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Branch */}
                <Input
                  label="Branch"
                  placeholder="e.g. Computer Science (CSE)"
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  error={errors.branch}
                  required
                  leftIcon={<BookOpen className="w-4 h-4" />}
                />

                {/* 6. Department */}
                <Input
                  label="Department"
                  placeholder="e.g. School of Computing"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  error={errors.department}
                  required
                  leftIcon={<Building className="w-4 h-4" />}
                />

                {/* 7. Section */}
                <Input
                  label="Section"
                  placeholder="e.g. B2 or Section A"
                  value={formData.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  error={errors.section}
                  required
                  leftIcon={<Grid className="w-4 h-4" />}
                />

                {/* 8. Contact Number */}
                <Input
                  label="Contact Number (WhatsApp)"
                  placeholder="9876543210"
                  value={formData.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  error={errors.contact}
                  required
                  leftIcon={<Phone className="w-4 h-4" />}
                  helperText="10-digit Indian number"
                />

                {/* 9. Email (Locked) */}
                <div className="sm:col-span-2">
                  <Input
                    label="Verified Email"
                    value={userEmail}
                    disabled
                    leftIcon={<Mail className="w-4 h-4" />}
                    rightIcon={<Lock className="w-4 h-4 text-outline" />}
                    helperText="Prefilled from authenticated account"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs text-outline font-body">
                  Generates ID format: <code>PH26-01-0001</code>
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                >
                  Submit & Generate ID
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
