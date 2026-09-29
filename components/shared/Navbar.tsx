"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Shield,
  ChevronDown,
  LogOut,
  User,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "./Button";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useEventSettings } from "@/lib/event-settings";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "landing" | "participant" | "admin";
  userProfile?: {
    fullName: string;
    participantId: string;
  } | null;
  onLogout?: () => void;
}

export function Navbar({ variant = "landing", userProfile, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { settings } = useEventSettings();
  const isRegistrationClosed =
    !settings.registration_open ||
    (settings.registration_deadline
      ? new Date(settings.registration_deadline).getTime() <= Date.now()
      : false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileDropdownOpen(false);
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileDropdownOpen]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Rounds", href: "/#rounds" },
    { name: "Evaluation", href: "/#evaluation" },
    { name: "Timeline", href: "/#timeline" },
    { name: "Checklist", href: "/#checklist" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
      {/* Floating Island Capsule Pill */}
      <div
        className={cn(
          "pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300 ease-out",
          "bg-[#0B0D14]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          "px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4",
          scrolled && "bg-[#090B10]/95 border-primary/30 shadow-[0_12px_40px_rgba(245,166,35,0.15)]"
        )}
      >
        {/* Left Branding: Logo + SYNERGY */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          {/* Logo container (squircle badge matching ref image) */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container-high/90 border border-primary/40 flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover:border-primary group-hover:shadow-amber-subtle transition-all">
            <img
              src="/finalsynergy1.png"
              alt="SYNERGY Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold font-headline tracking-widest text-on-surface group-hover:text-primary transition-colors">
              SYNERGY
            </span>
            {variant === "admin" && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary-container/50 text-secondary border border-secondary/40 font-mono font-bold">
                ADMIN
              </span>
            )}
          </div>
        </Link>

        {/* Center Nav Links (Landing variant only - Capsule Pill Buttons) */}
        {variant === "landing" && (
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-lowest/60 px-3 py-1 rounded-full border border-outline-variant/20">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-headline font-semibold text-outline hover:text-on-surface hover:bg-surface-container-high/60 px-3 py-1.5 rounded-full transition-all duration-150"
              >
                {link.name}
              </a>
            ))}
          </nav>
        )}

        {/* Participant Navigation Tabs */}
        {variant === "participant" && (
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-lowest/60 px-2 py-1 rounded-full border border-outline-variant/20">
            <Link
              href="/dashboard"
              className="text-xs font-headline font-bold uppercase tracking-wider text-primary bg-primary-container/20 px-3.5 py-1.5 rounded-full border border-primary/30 transition-colors"
            >
              Dashboard
            </Link>

            <Link
              href="/round-2"
              className="text-xs font-headline font-semibold uppercase tracking-wider text-outline hover:text-on-surface px-3.5 py-1.5 rounded-full transition-colors"
            >
              Round 2
            </Link>
          </nav>
        )}

        {/* Right Action Area (Sign In removed as requested, Register / Profile only) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {variant === "landing" && (
            !isRegistrationClosed ? (
              <Link href="/auth?tab=register" className="hidden sm:flex h-[46px] items-center scale-90 origin-right">
                <LiquidMetalButton label="Register" />
              </Link>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-xs font-headline font-semibold text-outline">
                <Lock className="w-3 h-3 text-error" />
                <span>Closed</span>
              </div>
            )
          )}

          {/* Participant Profile Dropdown Popover */}
          {variant === "participant" && userProfile && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={cn(
                  "flex items-center gap-2 p-1 pl-2.5 rounded-full bg-surface-container/80 border transition-all hover:bg-surface-container-high",
                  profileDropdownOpen
                    ? "border-primary/60 shadow-amber-subtle bg-surface-container-high"
                    : "border-outline-variant/40"
                )}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-on-surface font-headline leading-tight">
                    {userProfile.fullName}
                  </div>
                  <div className="text-[10px] font-mono text-primary font-semibold">
                    {userProfile.participantId}
                  </div>
                </div>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-container/20 border border-primary/40 flex items-center justify-center font-bold text-xs text-primary font-headline shadow-inner">
                  {userProfile.fullName.charAt(0).toUpperCase()}
                </div>

                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-outline transition-transform duration-200 mr-1",
                    profileDropdownOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl bg-[#0F111A]/95 border border-outline-variant/40 shadow-2xl backdrop-blur-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User details header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-outline-variant/30">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/40 flex items-center justify-center font-bold text-base text-primary font-headline shrink-0">
                      {userProfile.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold font-headline text-sm text-on-surface truncate">
                        {userProfile.fullName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-mono font-bold text-primary">
                          {userProfile.participantId}
                        </span>
                        <button
                          onClick={() => copyId(userProfile.participantId)}
                          className="p-1 rounded text-outline hover:text-primary transition-colors"
                          title="Copy ID"
                        >
                          {copiedId ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Info */}
                  <div className="py-3 space-y-2 border-b border-outline-variant/30 text-xs">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Verified Participant</span>
                    </div>
                    <div className="text-[11px] text-outline font-mono">
                      PROTOHACK 2026 Student
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {onLogout && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-wider text-error hover:bg-error-container/20 transition-all text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {variant === "admin" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary/40 text-secondary text-xs font-bold font-headline">
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Organizer Portal</span>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-on-surface" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto fixed top-20 left-4 right-4 bg-[#0B0D14]/95 border border-outline-variant/40 rounded-3xl backdrop-blur-2xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-200 z-50 lg:hidden">
          <div className="flex flex-col gap-3">
            {variant === "landing" && (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs uppercase font-headline font-bold tracking-wider text-outline hover:text-primary py-2.5 border-b border-outline-variant/20"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-3 flex justify-center w-full">
                  {!isRegistrationClosed ? (
                    <Link href="/auth?tab=register" onClick={() => setMobileMenuOpen(false)}>
                      <LiquidMetalButton label="Register" />
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-xs font-headline font-semibold text-outline">
                      <Lock className="w-3.5 h-3.5 text-error" />
                      <span>Registrations Stopped</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {variant === "participant" && (
              <>
                {userProfile && (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 mb-2">
                    <div className="font-bold text-sm text-on-surface font-headline">
                      {userProfile.fullName}
                    </div>
                    <div className="text-xs font-mono text-primary mt-0.5">
                      {userProfile.participantId}
                    </div>
                  </div>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase font-headline font-bold tracking-wider text-primary py-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/round-1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase font-headline font-bold tracking-wider text-outline py-2"
                >
                  Round 1
                </Link>
                <Link
                  href="/round-2"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase font-headline font-bold tracking-wider text-outline py-2"
                >
                  Round 2
                </Link>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs uppercase font-headline font-bold text-error py-2 text-left flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
