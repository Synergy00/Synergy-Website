"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Users,
  Calendar,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Layers,
  GitBranch,
  Cpu,
  Trophy,
  Award,
  FileText,
  Clock,
  Lock,
  Shield,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { AmbientGlow } from "@/components/shared/AmbientGlow";
import { Button } from "@/components/shared/Button";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { RegistrationCountdown } from "@/components/shared/RegistrationCountdown";
import { ServerClockRenderer } from "@/components/shared/ServerClockRenderer";
import { ProblemStatementsSection } from "@/components/landing/ProblemStatementsSection";
import { useEventSettings } from "@/lib/event-settings";
import { Chip } from "@/components/shared/Chip";

export default function LandingPage() {
  const { settings } = useEventSettings();
  const [isExpiredLocally, setIsExpiredLocally] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isRegistrationClosed = !settings.registration_open || isExpiredLocally;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqList = [
    {
      q: "Who is eligible to participate in PROTOHACK?",
      a: "PROTOHACK is exclusively designed for 1st- and 2nd-year undergraduate students across all branches and colleges. Beginners are completely welcome—the challenge is not intended to reward only students who already know how to code, but to provide a practical entry point into modern product development.",
    },
    {
      q: "Can I participate solo or do I need a team?",
      a: "Teams must contain 1 to 3 participants. Every participant must register individually on the portal to get a Participant ID (e.g. PH26-01-0001), after which a team lead can create a team or members can join using the team code (e.g. PHT01-DWFW).",
    },
    {
      q: "What is the prize for the winning teams?",
      a: "The top 3 teams selected from the Round 2 evaluation will be declared the winners of PROTOHACK and will receive Direct Club Entry into SYNERGY without going through the standard recruitment process, mapped to their domain of interest.",
    },
    {
      q: "What are the required submissions for Round 1?",
      a: "For Round 1 (Online Build window from Oct 4, 12:00 AM to Oct 7, 11:59:59 PM), teams submit: (1) A PPT presentation covering the problem, solution, target users, and architecture, and (2) A short description form of the planned build and development process.",
    },
    {
      q: "What happens in Round 2 (Offline Rapid Build)?",
      a: "Shortlisted teams report on October 10 at 9:00 AM to the offline venue. All teams receive the same common product problem statement, get 3–4 hours of build time to deliver a finishable working MVP, and face a Surprise Card Feature Reveal challenge halfway through, followed by live judge presentations.",
    },
    {
      q: "Are AI assistants and external libraries permitted?",
      a: "Yes! AI coding assistants and open-source libraries are permitted as development accelerators. However, teams remain responsible for understanding, integrating, and defending their code architecture and design decisions to judges.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      <AmbientGlow variant="full" />
      <Navbar variant="landing" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-24 sm:pt-48 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10">
        
        {/* Inverted Silver Sleek Arch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] max-w-[2000px] h-[850px] sm:h-[1200px] -z-10 pointer-events-none opacity-80">
          <svg
            viewBox="0 0 1440 1400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Arch fill (sleeker, tapered edges, slightly thick bottom) */}
            <path
              d="M-200,0 Q720,1306 1640,0 Q720,1314 -200,0 Z"
              fill="url(#silver-arch-gradient)"
              className="drop-shadow-2xl"
            />
            {/* Glow effect */}
            <path
              d="M-200,0 Q720,1310 1640,0"
              stroke="url(#silver-arch-glow)"
              strokeWidth="8"
              className="blur-xl opacity-60"
            />
            {/* Shine factor (Central bright spot/flare) */}
            <ellipse
              cx="720"
              cy="1310"
              rx="150"
              ry="4"
              fill="url(#shine-flare)"
              className="blur-[2px]"
            />
            <ellipse
              cx="720"
              cy="1310"
              rx="50"
              ry="2"
              fill="#ffffff"
              className="blur-[1px]"
            />
            <defs>
              <linearGradient id="silver-arch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0" />
                <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="75%" stopColor="#94a3b8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="silver-arch-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="1" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="shine-flare" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest/30 backdrop-blur-sm mb-8">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
            {isRegistrationClosed ? (
              <span className="text-error flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> REGISTRATIONS CLOSED
              </span>
            ) : (
              <span className="text-outline flex items-center gap-2">
                REGISTRATIONS OPEN · CLOSES OCT 3 <ChevronDown className="w-3 h-3 -rotate-90" />
              </span>
            )}
          </span>
        </div>

        <h1 className="font-headline font-bold text-on-surface tracking-tight leading-tight mb-6">
          <span className="block text-5xl sm:text-7xl lg:text-8xl mb-2 sm:mb-3">
            PROTOHACK
          </span>
          <span className="block text-2xl sm:text-4xl md:text-5xl font-semibold text-on-surface/90">
            The Product Build Challenge
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-outline max-w-3xl mx-auto font-body mb-8 leading-relaxed">
          The premier 2-round rapid-build challenge by SYNERGY for 1st & 2nd-year students. Learn, build, break the clock, and win Direct Club Entry.
        </p>

        {/* Live Registration & Server Clocks for Landing Hero */}
        <div className="mb-10 flex justify-center">
          <ServerClockRenderer
            placement="landing_hero"
            onClockExpire={() => setIsExpiredLocally(true)}
          />
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isRegistrationClosed ? (
            <Link href="/auth?tab=login" className="flex justify-center items-center h-[46px]">
              <LiquidMetalButton label="Participant Login" />
            </Link>
          ) : (
            <Link href="/auth?tab=register" className="flex justify-center items-center h-[46px]">
              <LiquidMetalButton label="Register Now" />
            </Link>
          )}
          
          <Link href="/admin/login" className="flex justify-center items-center h-[46px]">
            <Button 
              variant="secondary" 
              size="lg" 
              className="h-full px-8 rounded-full border border-outline-variant/30 bg-surface-container-high/40 backdrop-blur-sm hover:bg-surface-container-high transition-all text-on-surface"
            >
              <Shield className="w-4 h-4 mr-2 text-primary" /> Admin Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. ABOUT & CHALLENGE OBJECTIVE */}
      <section id="about" className="py-20 bg-surface-container-lowest/60 border-y border-outline-variant/20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
              CHALLENGE OBJECTIVE
            </span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
              Your First Real Product Build Experience
            </h2>
            <p className="text-sm sm:text-base text-outline mt-3">
              Learn, build, adapt, and finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Practical SDLC Stages",
                desc: "Understand the core stages of the Software Development Life Cycle through direct hands-on practice.",
                icon: <Layers className="w-6 h-6 text-primary" />,
              },
              {
                title: "Idea to Usable Product",
                desc: "Convert an authentic problem statement into a working deliverable with clean primary user flows.",
                icon: <Zap className="w-6 h-6 text-secondary" />,
              },
              {
                title: "Plan, Build, Test, Debug",
                desc: "Learn to scope essential features, test core flows, and deliver working builds under real clock deadlines.",
                icon: <Terminal className="w-6 h-6 text-primary" />,
              },
              {
                title: "Git, Version Control & Docs",
                desc: "Experience collaborative Git branching, repository documentation, and clear architectural explanation.",
                icon: <GitBranch className="w-6 h-6 text-success" />,
              },
              {
                title: "Prioritization & Scoping",
                desc: "Distinguish what must be built to prove an MVP from unnecessary bloat when time is constrained.",
                icon: <Cpu className="w-6 h-6 text-primary" />,
              },
              {
                title: "Performance Under Pressure",
                desc: "Demonstrate quick learning, problem solving, and resilience during surprise feature challenges.",
                icon: <Trophy className="w-6 h-6 text-secondary" />,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-container/80 border border-outline-variant/30 hover:border-primary/50 transition-all hover:shadow-amber-subtle group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold font-headline text-on-surface mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-outline font-body leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INCENTIVES & DIRECT CLUB ENTRY */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-secondary-container/30 via-surface-container to-primary-container/15 border border-primary/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider font-headline">
                <Trophy className="w-4 h-4" /> Official Reward
              </div>
              <h2 className="text-2xl sm:text-4xl font-headline font-bold text-on-surface">
                Top 3 Teams Win Direct Club Entry 🚀
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant font-body leading-relaxed">
                Skip the recruitment process. Winners get <strong>Direct Entry into SYNERGY Club</strong> mapped to their technical domain.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-lowest/80 border border-primary/50 text-center min-w-[220px]">
              <Award className="w-12 h-12 text-primary mx-auto mb-2" />
              <div className="text-2xl font-headline font-bold text-primary">Top 3 Teams</div>
              <div className="text-xs text-outline mt-1 font-body">Direct SYNERGY Recruitment</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRACKS & PROBLEM STATEMENTS (PS01 - PS10) */}
      <ProblemStatementsSection />

      {/* 5. ROUNDS BREAKDOWN */}
      <section id="rounds" className="py-20 bg-surface-container-lowest/60 border-y border-outline-variant/20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
              2-STAGE CHALLENGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
              Competition Structure & Rounds
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Round 1 */}
            <div className="p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/40 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary-container/20 text-primary border border-primary/30">
                    OCT 4 (12:00 AM) – OCT 7 (11:59:59 PM)
                  </span>
                  <span className="text-xs text-outline uppercase font-headline font-semibold">Online Build</span>
                </div>
                <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">
                  Round 1: Online Pre-Event Build
                </h3>
                <p className="text-sm text-outline mb-6 leading-relaxed">
                  Choose a domain, plan, design, and start building.
                </p>
                <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-xs sm:text-sm">
                  <div className="font-bold text-primary uppercase tracking-wider font-headline">Submission Deliverables:</div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span><strong>PPT Presentation Deck:</strong> Covering problem, solution, users & architecture</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span><strong>Short Description Form:</strong> Details of planned build & setup steps</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 text-xs text-outline font-body">
                Top teams will be shortlisted for the offline campus rapid build finale.
              </div>
            </div>

            {/* Round 2 */}
            <div className="p-8 rounded-2xl bg-surface-container/90 border border-primary/40 shadow-amber-subtle relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-secondary-container/40 text-secondary border border-secondary/30">
                    OCT 10 (09:00 AM) · ON-SITE
                  </span>
                  <span className="text-xs text-primary uppercase font-headline font-bold">Grand Finale</span>
                </div>
                <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">
                  Round 2: Offline Rapid Build Finale
                </h3>
                <p className="text-sm text-outline mb-6 leading-relaxed">
                  On-campus rapid build with a surprise feature reveal.
                </p>
                <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-xs sm:text-sm">
                  <div className="font-bold text-secondary uppercase tracking-wider font-headline">Round 2 Format:</div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span><strong>3 – 4 Hours:</strong> Rapid build of a finishable, working deliverable/MVP</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span><strong>Surprise Card Challenge:</strong> Feature reveal revealed halfway through</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span><strong>Live Defense:</strong> Product demo & technical Q&A with club leads</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/20 text-xs text-secondary font-headline font-bold">
                Winners get direct recruitment entry into SYNERGY.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UPDATED EVALUATION MATRICES */}
      <section id="evaluation" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
            OFFICIAL EVALUATION CRITERIA
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
            100-Point Scoring Frameworks
          </h2>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Round 1 Matrix */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
            <h3 className="text-lg font-bold font-headline text-primary mb-6">
              Round 1 Scoring Matrix (100 Points)
            </h3>
            <div className="space-y-4">
              {[
                { label: "Target Users & Technical Approach", weight: 40, desc: "Clarity on project, usability, navigation, and user consistency" },
                { label: "Functionality & Completeness", weight: 20, desc: "Core features work, demonstrable end-to-end" },
                { label: "Product Thinking & Problem Understanding", weight: 20, desc: "Clear problem definition, sensible feature choices & teamwork" },
                { label: "Documentation & Evidence", weight: 20, desc: "PPT and short description planning, setup instructions & development process" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold font-headline">
                    <span className="text-on-surface">{item.label}</span>
                    <span className="text-primary font-mono">{item.weight}%</span>
                  </div>
                  <div className="h-2 rounded bg-surface-container-lowest overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded"
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-outline/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Round 2 Matrix */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container/90 border border-outline-variant/30">
            <h3 className="text-lg font-bold font-headline text-secondary mb-6">
              Round 2 Finals Matrix (100 Points)
            </h3>
            <div className="space-y-4">
              {[
                { label: "Product Experience / UX", weight: 25, desc: "Is the product easy and logical to use? Main flow clarity" },
                { label: "Problem-Solution Fit", weight: 20, desc: "Does the product address the given problem clearly?" },
                { label: "Execution & Prioritisation", weight: 20, desc: "What was built in 3–4 hrs, and how effectively" },
                { label: "Presentation & Explanation", weight: 15, desc: "Clear explanation of choices, architecture, and live demo" },
                { label: "Innovation / Thoughtful Details", weight: 10, desc: "Smart implementation decisions or useful originality" },
                { label: "Teamwork & Response to Questions", weight: 10, desc: "Collaboration, ownership, and defense during judge Q&A" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold font-headline">
                    <span className="text-on-surface">{item.label}</span>
                    <span className="text-secondary font-mono">{item.weight}%</span>
                  </div>
                  <div className="h-2 rounded bg-surface-container-lowest overflow-hidden">
                    <div
                      className="h-full bg-secondary-container rounded"
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-outline/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tie Break Banner */}
        <div className="mt-8 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-outline font-body flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span><strong>Tie-Break Priority:</strong> 1st: Product Experience/UX → 2nd: Execution & Prioritisation → 3rd: Problem-Solution Fit.</span>
          </div>
        </div>
      </section>

      {/* 6. WHAT 'FINISHABLE' MEANS */}
      <section className="py-16 bg-surface-container-lowest/60 border-y border-outline-variant/20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
              DELIVERABLE STANDARD
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mt-1">
              What &quot;Finishable / Complete&quot; Means
            </h2>
            <p className="text-xs sm:text-sm text-outline mt-2">
              Build a meaningful MVP, not a full production-scale product.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "A clear primary user flow that works seamlessly.",
              "At least one end-to-end working core feature.",
              "Usable interface and sensible, intuitive navigation.",
              "Basic input validation and reliable error handling.",
              "A deployable build suitable for live evaluation.",
              "Clean code and inspectable project structure.",
            ].map((principle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/30 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-on-surface font-body">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RULES & AI POLICY */}
      <section id="rules" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
            INTEGRITY & POLICIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
            Rules, Regulations & AI Guidelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container/80 border border-outline-variant/30">
            <ShieldCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-bold font-headline text-on-surface mb-2">
              Team Locking
            </h3>
            <p className="text-sm text-outline font-body leading-relaxed">
              Teams of 1 to 3 participants. Participants must use the same registered team for both rounds. No substitutions after shortlisting without organizer approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/80 border border-outline-variant/30">
            <Cpu className="w-8 h-8 text-secondary mb-3" />
            <h3 className="text-lg font-bold font-headline text-on-surface mb-2">
              Transparent AI Policy
            </h3>
            <p className="text-sm text-outline font-body leading-relaxed">
              AI assistants & open-source libraries are permitted as accelerators. However, all team members must be ready to explain and defend every line of code to judges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/80 border border-outline-variant/30">
            <Terminal className="w-8 h-8 text-success mb-3" />
            <h3 className="text-lg font-bold font-headline text-on-surface mb-2">
              Originality & Security
            </h3>
            <p className="text-sm text-outline font-body leading-relaxed">
              All work must be completed within the round window. Secrets and API keys must never be committed to public repositories. Plagiarism leads to disqualification.
            </p>
          </div>
        </div>
      </section>

      {/* 8. OFFICIAL UPDATED TIMELINE */}
      <section id="timeline" className="py-20 bg-surface-container-lowest/60 border-y border-outline-variant/20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
              OFFICIAL TIMELINE (IST)
            </span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
              Event Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                date: "Sep 28 – Oct 3 (10:00 PM)",
                title: "Registrations Open",
                desc: "Register on the portal, complete profile & form 1-3 member teams.",
                active: true,
              },
              {
                date: "Oct 4 (12:00 AM) – Oct 7",
                title: "Round 1 Online Window",
                desc: "Choose idea, plan & build; submit PPT deck and short description before 11:59:59 PM.",
                active: false,
              },
              {
                date: "Oct 8 – 9",
                title: "Evaluation & Shortlisting",
                desc: "Organizers and coordinators evaluate submissions and announce shortlisted teams.",
                active: false,
              },
              {
                date: "Oct 10 (09:00 AM)",
                title: "Round 2 Finale (Offline)",
                desc: "On-site 3–4 hr rapid build + surprise feature reveal. Top 3 win Direct Club Entry!",
                active: false,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-container/80 border border-outline-variant/30 relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-primary mb-2">
                    {item.date}
                  </div>
                  <h3 className="text-base font-bold font-headline text-on-surface mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-outline font-body leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PARTICIPANT CHECKLIST */}
      <section id="checklist" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
            ESSENTIAL GUIDELINES
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
            Participant Checklist & Best Practices
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Problem First, Code Second",
              desc: "Deeply understand the problem statement and user pain points before writing the first line of code.",
            },
            {
              title: "Define Core Deliverables",
              desc: "Scope a single working primary user flow; actively discard unnecessary or bloated features.",
            },
            {
              title: "Task Division & Teamwork",
              desc: "Divide clear frontend, backend, and UI/presentation responsibilities across team members.",
            },
            {
              title: "Disciplined Git & Versioning",
              desc: "Commit early and often with clear messages; avoid merge conflicts by maintaining modular components.",
            },
            {
              title: "Zero Secrets in Code",
              desc: "Never commit API keys or database service role credentials to public Git repositories.",
            },
            {
              title: "End-to-End Flow Testing",
              desc: "Test every step of the main user journey on a fresh device before final submission freeze.",
            },
            {
              title: "Clean PPT & Short Description",
              desc: "Prepare a clear presentation deck covering problem, target users, tech architecture & prototype evidence.",
            },
            {
              title: "Structured Defense Pitch",
              desc: "Have a concise 4-step pitch ready: Problem → Solution → Architecture & Tech → Live Working Demo.",
            },
            {
              title: "Prioritise Complete over Complex",
              desc: "A fully working 1-feature MVP will always score higher than 5 half-finished, buggy features.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface-container/80 border border-outline-variant/30 flex items-start gap-3.5 hover:border-primary/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                0{idx + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold font-headline text-on-surface mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-outline font-body leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-headline font-bold tracking-widest text-primary">
            QUESTIONS?
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqList.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-surface-container/90 border border-outline-variant/30 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:text-primary transition-colors"
                >
                  <span className="text-sm sm:text-base font-headline font-semibold text-on-surface">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-outline transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-outline font-body leading-relaxed border-t border-outline-variant/20 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL CTA BAND */}
      <section className="py-20 bg-gradient-to-b from-surface-container-lowest to-surface border-t border-outline-variant/20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-headline font-bold text-on-surface mb-4">
            Ready to Build Under the Clock?
          </h2>
          <p className="text-base sm:text-lg text-outline font-body mb-8 max-w-2xl mx-auto">
            {isRegistrationClosed
              ? "The registration window for PROTOHACK has ended."
              : "Registration closes October 3 at 11:59 PM IST."}
          </p>
          {isRegistrationClosed ? (
            <div className="flex justify-center items-center mt-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-high/60 border border-outline-variant/40 text-outline cursor-not-allowed select-none shadow-sm backdrop-blur-md opacity-85">
                <Lock className="w-4 h-4 text-error" />
                <span className="text-sm font-headline font-semibold text-on-surface-variant">
                  Registrations Stopped
                </span>
              </div>
            </div>
          ) : (
            <Link href="/auth?tab=register" className="flex justify-center items-center mt-4">
              <LiquidMetalButton label="Register Now" />
            </Link>
          )}
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-12 bg-surface-container-lowest border-t border-outline-variant/20 text-xs text-outline relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary fill-primary" />
            <span className="font-headline font-bold text-on-surface">
              PROTOHACK 2026
            </span>
            <span>· Organized by SYNERGY AI Club</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="mailto:synergy.srmrmp2026@gmail.com" className="hover:text-primary transition-colors">
              Contact Organizers / Grievance
            </a>
            <span>·</span>
            <Link href="/code-of-conduct" className="hover:text-primary transition-colors">
              Code of Conduct
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>

          <div>© 2026 SYNERGY. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
