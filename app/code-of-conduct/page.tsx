"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function CodeOfConductPage() {
  return (
    <main className="min-h-screen bg-surface-lowest text-on-surface flex flex-col font-body selection:bg-primary/30 selection:text-primary">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-24 sm:py-32">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">Code of Conduct & Club Policies</h1>
        </div>

        <div className="prose prose-invert prose-p:text-outline prose-headings:text-on-surface max-w-none">
          <p className="text-sm text-outline-variant mb-8">SYNERGY AI Club - Student Club Governance Document</p>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">1. Purpose and Scope</h2>
            <p>
              This document establishes the standards of conduct, operating policies, responsibilities, and procedures applicable to members, volunteers, coordinators, and student leaders of Synergy AI Club. Its purpose is to create a respectful, inclusive, professional, and productive environment for learning, innovation, collaboration, and technical growth.
            </p>
            <p className="mt-2">
              These policies apply during club meetings, workshops, hackathons, projects, competitions, official online groups, social-media activities, and other activities carried out in the name of the club.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">2. Club Values</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-outline">
              <li><strong>Respect:</strong> Treat every member, guest, speaker, volunteer, and faculty member with dignity.</li>
              <li><strong>Learning:</strong> Encourage curiosity, questions, experimentation, and continuous improvement.</li>
              <li><strong>Collaboration:</strong> Share knowledge and work constructively as a team.</li>
              <li><strong>Integrity:</strong> Be honest about contributions, results, attendance, and achievements.</li>
              <li><strong>Inclusivity:</strong> Maintain a welcoming environment regardless of background, skill level, or experience.</li>
              <li><strong>Responsibility:</strong> Complete agreed tasks, communicate delays, and take ownership of commitments.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">3. Code of Conduct</h2>
            <h3 className="text-xl font-headline font-semibold mb-2 mt-4">3.1 Respectful Behaviour</h3>
            <p>
              Members must communicate respectfully, including during discussions, debates, and code reviews. Harassment, discrimination, bullying, derogatory comments, or exclusionary behaviour will not be tolerated.
            </p>
            
            <h3 className="text-xl font-headline font-semibold mb-2 mt-4">3.2 Academic and Technical Integrity</h3>
            <p>
              Members must give proper credit for code, ideas, algorithms, and designs. Plagiarism or misrepresenting others' work as one's own is prohibited. Respect intellectual property, including open-source licenses and university guidelines.
            </p>

            <h3 className="text-xl font-headline font-semibold mb-2 mt-4">3.3 Responsibility for Resources</h3>
            <p>
              Use club and university resources (e.g., servers, labs, software accounts, funds, equipment) responsibly and solely for their intended purposes. Report any damage, loss, or misuse immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">4. Grievance and Reporting</h2>
            <p>
              If a member experiences or witnesses a violation of this Code of Conduct, they should report it immediately. Reports will be handled confidentially.
            </p>
            <div className="mt-4 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <p className="font-medium text-on-surface">Report Violations To:</p>
              <p className="mt-2 text-outline">Email: <a href="mailto:synergy.srmrmp2026@gmail.com" className="text-primary hover:underline">synergy.srmrmp2026@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
