"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-p:text-outline prose-headings:text-on-surface max-w-none">
          <p className="text-sm text-outline-variant mb-8">Effective Date: September 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">1. Introduction</h2>
            <p>
              Welcome to the SYNERGY Registration Portal ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India. This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">2. Data Collection & Purpose</h2>
            <p>We collect the following personal data exclusively for the purpose of organizing and managing the PROTOHACK challenge:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-outline">
              <li><strong>Identity Data:</strong> Full Name, Registration Number, Year of Study, Department.</li>
              <li><strong>Contact Data:</strong> Institutional Email Address, GitHub Profile, LinkedIn Profile.</li>
              <li><strong>Technical Data:</strong> Submissions, event logs, and IP addresses for security auditing.</li>
            </ul>
            <p className="mt-4">
              <strong>Purpose:</strong> Your data is used strictly to verify your eligibility as a student, coordinate team formations, evaluate submissions, and communicate updates regarding the event.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">3. Consent & Rights under DPDP Act</h2>
            <p>By registering on this portal, you provide explicit consent to the processing of your data for the stated purposes. Under the DPDP Act, you possess the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-outline">
              <li><strong>Right to Information:</strong> You can request a summary of the personal data being processed.</li>
              <li><strong>Right to Correction & Erasure:</strong> You can request correction of inaccurate data or deletion of your data once the event concludes.</li>
              <li><strong>Right of Grievance Redressal:</strong> You can reach out to our designated Grievance Officer for any concerns.</li>
              <li><strong>Right to Nominate:</strong> You have the right to nominate someone to exercise your rights in the event of death or incapacity.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">4. Data Security & Retention</h2>
            <p>
              We implement reasonable security practices to protect your data from unauthorized access, modification, or disclosure. Data is stored securely and access is restricted to authorized SYNERGY administrators. We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-headline font-bold mb-4">5. Grievance Redressal</h2>
            <p>
              If you have any questions, concerns, or wish to exercise your rights regarding your personal data, please contact our Grievance Officer:
            </p>
            <div className="mt-4 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <p className="font-medium text-on-surface">SYNERGY Data Protection & Grievance Officer</p>
              <p className="mt-2 text-outline">Email: <a href="mailto:synergy.srmrmp2026@gmail.com" className="text-primary hover:underline">synergy.srmrmp2026@gmail.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
