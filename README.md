# PROTOHACK 2026: The Product Build Challenge

The official event and registration platform for **PROTOHACK 2026**, organized by **SYNERGY**. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase.

---

## ⚡ Tech Stack & Features

- **Frontend**: Next.js 14 (App Router) + TypeScript + React 18
- **Design System**: Neo-Obsidian Amethyst (`#141317`) with Molten Amber (`#F5A623`) accents, Space Grotesk, Inter, JetBrains Mono
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Google OAuth & Email/Password)
- **Admin Portal**: Dedicated server-side bcrypt cookie session with rate-limiting (5 failed attempts = 5 min lockout)
- **Real-Time Event Operations**:
  - Participant profile completion & immutable `PH26-XXXXX` sequence generation
  - 1–3 member squad creation & 6-character team codes with live preview
  - Server-synchronized countdown clock (IST)
  - Round 1 and Round 2 locked/unlocked dynamic guards
  - Admin shortlisting engine & real-time global event switches

---

## 🚀 Quickstart & Setup (Under 3 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Credentials
ADMIN_ID=admin_synergy
ADMIN_PASSWORD_HASH=$2a$10$gP7B9tW1y4p1hM8E7lO/Tu89bT9l7S7L6E/0k8W9x7q6e3p2b1z.q
ADMIN_SESSION_SECRET=super_secret_session_key_protohack_2026_synergy_admin_key_32chars
```

*(Default demo admin credentials: ID: `admin_synergy` | Password: `protohack2026admin`)*

### 3. Run Database Migrations
Run the SQL queries in `supabase/schema.sql` inside your Supabase SQL Editor.

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Routes & Information Architecture

| Route | Purpose | Access |
|---|---|---|
| `/` | Event Landing Page (About, Rounds, Timeline, FAQ) | Public |
| `/auth` | Sign In / Register (Email/Password + Google OAuth) | Public |
| `/profile/complete` | Mandatory Student Verification & ID Generation | Authenticated |
| `/dashboard` | Squad Creation / Joining & Live Countdown Clock | Registered |
| `/round-1` | Round 1 Online Challenge & Submission Form | Squad Members |
| `/round-2` | Round 2 Grand Finale (Offline) Schedule & Logistics | Shortlisted Finalists |
| `/admin/login` | Organizer Login (Rate-Limited) | Public |
| `/admin/participants` | Participant Roster, Filters & CSV Export | Admin |
| `/admin/teams` | Squads Directory, Member Expanders & Disband Tool | Admin |
| `/admin/shortlisting` | Bulk Shortlisting Engine for Round 2 | Admin |
| `/admin/event-controls` | Live Countdown Broadcaster & Global Round Switches | Admin |

---

## 🛡️ Business Rules & Integrity Guarantees

- **One Squad per Student**: Enforced at database level with unique primary key constraints on `team_members.profile_id`.
- **Permanent Locking**: Profile credentials and squad formations are permanently immutable after initial submission.
- **Atomic Capacity**: Concurrency-safe team joining prevents oversubscribing the 3-member team cap.
- **Leader Succession**: Removing a team lead automatically delegates leadership to the earliest-joined teammate.

---

© 2026 SYNERGY. All rights reserved.
