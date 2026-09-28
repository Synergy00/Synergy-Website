# PROTOHACK Event Platform: Product Requirements Document (PRD)

**Product:** PROTOHACK: The Product Build Challenge (organized by SYNERGY)
**Deliverable:** Participant website + Admin portal, designed and coded end to end
**Build tool:** Google Antigravity (agent-driven build)
**Design source of truth:** the existing landing page (`/design-reference/protohack_the_product_build_challenge/code.html` and `screen.png`). Every screen must look like it belongs to that page.
**Event year:** 2026 (registration Sep 28 – Oct 4, Round 1 Oct 4 – 7, judging Oct 8 – 9, Round 2 offline on Oct 10, all IST)

---

## 1. Overview

### 1.1 What we are building
1. **Participant website:** a landing page that explains the whole event, a single **Register Now** flow (auth → profile → participant ID), a dashboard with one-time team creation/joining, and locked/unlocked Round 1 and Round 2 pages.
2. **Admin portal:** a basic ID + password login and four tools: Participants, Teams, Shortlisting, Event Controls (countdown timer + Round 1 unlock).

### 1.2 Goals
- Any student can register, get a participant ID, and be in a team in under 5 minutes.
- Organizers can see every participant and team in tables, remove either, shortlist teams for Round 2, set the countdown, and unlock rounds without touching the database.
- The whole product feels like one premium, cohesive dark-amber experience.

### 1.3 Non-goals (do NOT build)
Leaderboards, scoring/judging tools, chat, notifications/email campaigns, profile editing after submission, team leaving/transfers, payment, analytics dashboards, audit logs, multi-admin roles, submission uploads (see Open Questions), fake "system status" widgets of any kind.

---

## 2. Instructions for the Antigravity agent

1. **Read the design reference first.** Copy the Stitch export folder into the repo at `/design-reference/`. Open `protohack_the_product_build_challenge/code.html` and `screen.png`. Copy its Tailwind config (colors, fonts, font sizes, spacing, radii) verbatim into `tailwind.config.ts`. Do not invent a new palette.
2. Other screens in `/design-reference/` (dashboard, modals, admin) are **layout inspiration only**. They contain unwanted content (fake telemetry, ranks, tracks, Discord, audit logs, hardware-token login). Follow this PRD for content. Follow the landing page for visual style.
3. Build in the order given in Section 14. Ship shared components (navbar, cards, buttons, inputs, modal, table) before pages.
4. Use real data flow (database, auth, server-side validation). No hard-coded mock data in production paths. Provide a seed script for demo data.
5. After each milestone, run the app, click through the flows in Section 13, and fix issues before moving on.
6. Never add features, pages or UI text that are not in this document.

---

## 3. Users and roles

| Role | Description | Access |
|---|---|---|
| Visitor | Not logged in | Landing page, auth page |
| Participant | Logged-in student (1st/2nd year, any branch) | Profile completion, dashboard, Round 1, Round 2 (if shortlisted) |
| Team Lead | Participant who created a team | Same as participant; additionally added the initial members |
| Admin | Organizer | Admin portal only (separate login, separate session) |

---

## 4. Tech stack and architecture

Recommended (change only if there is a strong reason):
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS with the config copied from the landing page reference; Material Symbols Outlined icons; Google Fonts: Space Grotesk (600, 700) and Inter (400, 600, 700)
- **Backend / DB / Auth:** Supabase (Postgres, Auth with email + password and Google OAuth, Row Level Security)
- **Admin auth:** custom, server-side. Credentials from environment (`ADMIN_ID`, `ADMIN_PASSWORD_HASH` using bcrypt), session in a signed httpOnly cookie. No admin signup screen.
- **Validation:** Zod on client and server
- **Deployment target:** Vercel (or any Node host)

Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ID`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`.

Time: store all timestamps in UTC, display in IST. The countdown must use **server time** (send a server timestamp with the target and compute the offset on the client) so wrong device clocks do not break it.

---

## 5. Design system (extracted from the landing page)

**Mood:** premium dark-mode tech event, "midnight obsidian with molten amber light". Rich, not flat. Do not simplify or flatten.

### 5.1 Color tokens (use these Tailwind names exactly)
| Token | Hex | Use |
|---|---|---|
| `background` / `surface` / `surface-dim` | `#141317` | Page background |
| `surface-container-lowest` | `#0F0E12` | Navbar (80% opacity + blur), alternate sections, progress tracks |
| `surface-container-low` | `#1C1B1F` | Inner cards |
| `surface-container` | `#201F23` | Main cards |
| `surface-container-high` | `#2B292E` | Chips, hover rows, inset rows |
| `surface-container-highest` / `surface-variant` | `#363439` | Dividers, borders |
| `on-surface` | `#E6E1E7` | Primary text |
| `on-surface-variant` | `#D7C3AE` | Muted text |
| `primary` | `#FFC880` | Highlights, active text, links |
| `primary-container` | `#F5A623` | **Main accent**: buttons, glow, key numbers |
| `on-primary` | `#452B00` | Text on amber buttons |
| `secondary` | `#E7B4FA` | Small violet accents |
| `secondary-container` | `#613874` | Violet glow in backgrounds |
| `outline-variant` | `#524534` | Borders |
| `error` / `error-container` | `#FFB4AB` / `#93000A` | Errors, destructive actions |
Success uses green `#7EE0A1` (add as `success`).

### 5.2 Typography
- **Space Grotesk:** display, headlines, labels, buttons, numbers. **Inter:** body and titles.
- Scale (from the landing config): display 56/64, headline-lg 40/48, headline-md 28/36, headline-sm 22/28, title-lg 18/26, title-md 16/24, body-lg 16/26, body-md 14/22, body-sm 12/18, label-lg 14 (0.05em), label-md 12 (0.08em), label-sm 10 (0.1em, bold). Mobile: display-mobile 38/44, headline-lg-mobile 30/36.
- Eyebrows and section labels: `label-sm`, uppercase, `tracking-widest`, `text-primary`, bold.
- Nav links and buttons: `label-md`, uppercase, `tracking-wider`.

### 5.3 Spacing and shape
`space-xs 4px, space-sm 8px, space-md 16px, space-lg 24px, space-xl 40px, gutter 24px, margin 48px` (mobile: gutter 16px, margin 20px). Cards use `rounded-xl bg-surface-container shadow-md p-space-lg`. Inner rows use `rounded-lg bg-surface-container-low` or `-high`. Content width `max-w-6xl` centered.

### 5.4 Signature elements (must be reproduced)
- **Navbar:** fixed, `h-20`, `bg-surface-container-lowest/80 backdrop-blur-xl`, shadow `0 1px 8px rgba(0,0,0,0.4)`. Left: 36px rounded logo tile with the `bolt` icon in `primary`, then "PROTOHACK" (headline-sm, uppercase, tracking-wider) with "THE PRODUCT BUILD CHALLENGE" under it (label-sm, primary). Active nav link: `text-primary font-semibold border-b-2 border-primary`.
- **Primary button:** `bg-primary-container text-on-primary rounded-lg px-6 py-2 label-md uppercase font-bold`, hover `bg-primary` + glow `shadow-[0_0_20px_rgba(245,166,35,0.45)]`, `transition-all`. Secondary button: transparent, 1px `outline-variant` border, `text-primary`, hover fill `surface-container-high`. Destructive: `bg-error-container text-on-error-container`.
- **Ambient background lighting:** absolutely positioned blurred circles: a 900×500 `secondary-container/20` blur-[140px] centered above the hero, and a 600×600 `primary-container/10` blur-[160px] on the right. Reuse on auth, dashboard, and admin login (smaller on admin).
- **Section rhythm:** sections alternate `bg-background` and `bg-surface-container-lowest`.
- **Progress bars:** `h-2 rounded bg-surface-container-lowest`, amber fill.
- **Accordion (FAQ):** `rounded-xl bg-surface-container`, header row hover `text-primary`, chevron rotates 180°.
- **Modals:** dimmed + blurred backdrop, glass card (`surface-container` at 90% with blur), amber-glow border on focus/success.
- **Icons:** Material Symbols Outlined, `text-primary` on feature cards.
- **Motion:** 200ms transitions, hover lift and glow on cards; countdown digits animate on change. Respect `prefers-reduced-motion`.

### 5.5 Copy rules
Use "Team" (never "squad"). Participant ID format `PH26-00124`. Team code: 6 uppercase alphanumeric characters (no `0/O/1/I`), shown like `7K29X4`. No jargon like "telemetry", "node", "cryptographic".

---

## 6. Information architecture

### 6.1 Routes
| Route | Screen | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/auth` | Sign in / Create account | Public (Register Now goes here, sign-up tab selected) |
| `/profile/complete` | Complete profile | Logged in, profile missing |
| `/dashboard` | Dashboard | Logged in + profile complete |
| `/round-1` | Round 1 | Same |
| `/round-2` | Round 2 | Same |
| `/admin/login` | Admin login | Public |
| `/admin/participants` | Participants | Admin |
| `/admin/teams` | Teams | Admin |
| `/admin/shortlisting` | Shortlisting | Admin |
| `/admin/event-controls` | Event Controls | Admin |

### 6.2 Route guards
- Logged out visiting a participant route → `/auth`.
- Logged in, profile incomplete → always `/profile/complete`.
- Logged in, profile complete, visiting `/auth` or `/profile/complete` → `/dashboard`.
- Admin routes require the admin cookie, otherwise `/admin/login`. Participant sessions never grant admin access and vice versa.

### 6.3 Participant navbar (logged-in screens)
Logo left. Tabs: **Dashboard**, **Round 1**, **Round 2**. Locked tabs show a `lock` icon, dimmed text, and a tooltip "Unlocked by organizers". Clicking a locked tab opens its locked page (Section 7.8). Right side: avatar initials + first name, and a Logout button. Nothing else.

---

## 7. Screen specifications

### 7.1 Landing page (`/`)
Base it on the existing landing page design. Keep its visual language and section structure. **Content changes:**
- **Single CTA:** "Register Now" in the navbar, hero, and final CTA section. Remove "Explore Rounds", the profile avatar in the navbar, and any other buttons. "Contact Organizers" becomes a plain `mailto:` text link in the footer.
- Navbar links (anchor scroll, active state on scroll): About, Rounds, Evaluation, Timeline, Rules & AI, FAQ.
- Fix inconsistencies: use **2026** everywhere (remove "Season 24", "© 2024"); use "team" instead of "squad"; remove the "Registration closes soon" pill, or drive it from a config date.
- **Sections in order:**
  1. **Hero:** PROTOHACK title, "The Product Build Challenge", tagline "Learn. Build. Break the Clock.", short description, Register Now, four fact chips (Teams of 1 – 3, 2 Rounds Online & In-Person, 100% Free, 1st & 2nd Year).
  2. **About: Why PROTOHACK?** six cards (Understand SDLC stages, Idea to usable product, Plan/build/test/debug, Real Git & VCS workflows, Scoping & prioritization, Execute under clock pressure), one sentence each.
  3. **Who can participate + Registration checklist:** eligibility (1st & 2nd year, all branches, beginner-friendly, solo or up to 3), checklist (College ID, GitHub accounts for all members, laptop and charger for the offline round, free).
  4. **How it works:** 5-step path (Register, Participant ID, Create/Join Team, Round 1 Build, Round 2 Sprint).
  5. **Rounds:** Round 1 (online, 3 – 4 days, open-ended problem in FinTech / EdTech / Developer Tools / Civic Tech; deliverables: PDF/PPT deck max 8 slides, public GitHub repo with README, working video demo; top 25% advance). Round 2 (Oct 10, offline, problem revealed that morning, 3 – 4 hour build, surprise feature at halfway, 4-minute live demo with judges, venue SYNERGY Campus Hub).
  6. **Evaluation:** two panels with weighted bars. Round 1: Functionality & Completeness 30, Product Thinking 20, UX/Interface/Accessibility 15, Code Quality 15, Testing/Error Handling 10, Documentation & Git 10. Round 2: Product Experience/UX 25, Problem-Solution Fit 20, Execution & Prioritization Under Pressure 20, Live Presentation & Architecture Defense 15, Innovation 10, Teamwork & Q&A 10. Note: "Cutoff and number of shortlisted teams announced after Round 1."
  7. **What "Finishable" means:** keep the existing short principle + 5-point checklist.
  8. **Rules & AI:** Team rules (1 – 3 members; roster locked; no substitutions after shortlisting without organizer sign-off), Originality & Ethics, Transparent AI Policy (LLMs welcome as accelerators; judges will ask you to explain your code).
  9. **Official timeline (IST):** Sep 28 – Oct 4 Registrations Open; Oct 4 – 7 Round 1 Online Sprint (deck upload before 11:59 PM IST); Oct 8 – 9 Judging & Shortlist; Oct 10 Offline Rapid Build (grand finale).
  10. **FAQ accordion** (existing 6 questions; first one open).
  11. **Final CTA band** with Register Now, then footer (SYNERGY blurb, Code of Conduct, Privacy Policy, Terms links as simple text; `© 2026 SYNERGY`).
- Fully responsive; nav collapses to a hamburger below `lg`.

### 7.2 Auth (`/auth`)
- Layout: centered glass card over the ambient background; small "← Back to event page" link top-left; PROTOHACK logo on top. On desktop, an optional left decorative panel with the tagline.
- Tabs: **Sign in** | **Create account** (Register Now opens Create account).
- Sign in: Email, Password (show/hide), "Forgot password?" (Supabase reset email), primary **Sign in**.
- Create account: Email, Password (min 8 chars), Confirm password, primary **Create account**.
- Divider "or" + **Continue with Google**.
- Footer line: "By continuing you agree to the event Code of Conduct."
- Errors inline: wrong credentials, email already registered, weak password, password mismatch.
- After success: profile exists → `/dashboard`, else → `/profile/complete`.
- No name field, no "remember me", no security badges.

### 7.3 Complete profile (`/profile/complete`)
- Navbar: logo + Logout only.
- Heading "Complete your profile". Subtext: "These details verify your eligibility and can't be edited after you submit."
- Fields (2 columns desktop, 1 mobile), **all required**, each with a leading icon:
  1. Full name
  2. Registration number (unique)
  3. College name
  4. Branch (e.g. CSE)
  5. Department
  6. Section
  7. Contact number (`+91` prefix, 10 digits, starts with 6 – 9)
  8. Email (read-only, prefilled from auth, lock icon)
- Button: **Submit & generate Participant ID**.
- On submit: server validates, creates the profile, generates the participant ID (`PH26-` + zero-padded sequence), then shows the **success state**: glowing check, "You're registered!", the ID in large amber text with a copy button, and **Go to dashboard**.
- Profile fields are read-only forever after this (no edit page).

### 7.4 Dashboard: no team (`/dashboard`)
- Navbar with Dashboard active, Round 1 and Round 2 locked.
- Large greeting: "Hello, {first name} 👋". Under it, participant ID chip `PH26-00124` with copy icon.
- **Warning banner** (amber border, warning icon): "Heads up: you can create or join a team only ONCE. Changes aren't possible afterwards, so be careful."
- Two equal cards with hover glow:
  - **Create a team:** "Become the team lead, name your team and add members." Button **Create team** (opens modal 7.5).
  - **Join a team:** "Got a team code? Enter it to join your team." Button **Join team** (opens modal 7.6).
- Nothing else on the page (no stats, no timeline, no rank).

### 7.5 Create team modal
- Title "Create your team". Amber notice: "You'll become the team lead. Team creation is one-time and can't be changed afterwards."
- **Team name** input (3 – 30 chars, unique, case-insensitive).
- **Add members (optional, up to 2 more):** search input "Search by Participant ID or name" (min 2 characters, debounced 300 ms). Result rows show initials avatar, name, participant ID, college and an **Add** button. Participants already in a team show a disabled "Already in a team". Never show email or phone in results.
- **Your team:** lead row (badge "Team Lead · You"), added members with a remove (x) button (before creation only), counter `n / 3`.
- Footer: **Cancel** and **Create team**. Creating a team with only the lead (solo) is allowed.
- On confirm: an extra confirmation step "This can't be undone. Create team?" then a single atomic server call.
- **Success state:** glowing check, "Team created 🎉", the 6-character code in large spaced boxes with **Copy code**, helper "Share this code so teammates can join", and **Go to dashboard**.

### 7.6 Join team modal
- Title "Join a team", subtext "Enter the 6-character code from your team lead."
- Six code boxes (auto-advance, paste support, uppercase).
- On complete entry, look up the code and show a preview card: team name, lead name, members `n / 3`, green "Team found" chip.
- Errors: "Invalid code", "This team is full".
- Amber warning: "Joining is permanent. You can't leave or switch teams afterwards."
- Buttons: **Cancel**, **Join team** (disabled until a valid, non-full team is found).
- Success: "You've joined {Team name}" + **Go to dashboard**.

### 7.7 Dashboard: with team
- Create/Join cards and the warning banner are **removed** from the page permanently once the participant is in a team.
- Greeting "Hello, {first name} 👋".
- **Hero countdown card** (main focus): amber-gradient-bordered glass card, label from admin (e.g. "ROUND 1 STARTS IN"), four large digit blocks Days : Hours : Minutes : Seconds with glow. If no countdown is set: "Countdown will be announced soon" with a clock icon. At zero: digits show `00` and the label switches to "It's time! Head to Round 1" (link) if Round 1 is unlocked, otherwise "Starting soon".
- **Your team card:** team name, team code with copy button, member cards (initials avatar, name, participant ID; lead has a star badge). If the team is shortlisted, show an amber "Shortlisted for Round 2 🎉" chip.

### 7.8 Round 1 and Round 2 pages
Each has a locked and unlocked state, shown inside the participant layout.
- **Locked:** centered glass card, large glowing lock icon, "Round 1 is locked" / "Round 2 is locked", "Organizers will unlock this soon." (Round 2: "Round 2 opens only for shortlisted teams."), **Back to dashboard**.
- **Unlocked Round 1:** title "Round 1 · Online Build", status chip "Open", short description, and two placeholder cards "Problem statement" and "Submission details" (content to be added later; keep the layout ready).
- **Unlocked Round 2:** same layout, plus a congratulations banner "Your team is shortlisted for Round 2, October 10, offline at campus."
- Users must be in a team to open Round 1. If not, show the locked card with "Create or join a team first" and a button to the dashboard.

### 7.9 Admin login (`/admin/login`)
Centered glass card, PROTOHACK logo with an "Admin" chip. Fields: Admin ID, Password (show/hide). Button **Login**. Error "Invalid ID or password". Rate limit: 5 failed attempts → 5 minute lockout per IP. No other elements.

### 7.10 Admin shell
Left sidebar (logo, items **Participants**, **Teams**, **Shortlisting**, **Event Controls**, Logout at the bottom) + top bar with page title. Same theme, denser tables. Sidebar collapses to icons on tablet and a drawer on mobile.

### 7.11 Admin: Participants (`/admin/participants`)
- Summary cards: Total participants, In a team, Without a team.
- Toolbar: search (name, participant ID, reg no, college, email), filters College, Branch, Team status (In a team / No team), **Export CSV**.
- Table columns: Participant ID, Name, Reg No, College, Branch, Dept, Section, Contact, Email, Team, Actions. Sortable headers, sticky header, zebra rows, server-side pagination (25 per page).
- Row action **Remove** (red icon) → confirm dialog: "Remove {name}? Their registration will be deleted and they'll be removed from their team." On confirm follow the rules in Section 8.4.

### 7.12 Admin: Teams (`/admin/teams`)
- Summary cards: Total teams, Full (3/3), Incomplete (1 – 2).
- Toolbar: search (team name, code, member name), filters Size (1/2/3), Status (Round 1 / Shortlisted), **Export CSV**.
- Table columns: Team name, Team code (copy), Team lead, Members (names + participant IDs, expandable row), Size (`n/3` chip), Status chip (Round 1 grey, Shortlisted amber), Actions.
- Actions: **View members** (expand) and **Remove team** → confirm: "Remove {team}? All members will be released and can create or join a team again."

### 7.13 Admin: Shortlisting (`/admin/shortlisting`)
- Heading "Shortlist teams for Round 2" + subtext "Selected teams' members get Round 2 unlocked on their dashboard."
- Summary chips: total teams, shortlisted count.
- Toolbar: search, status filter (All / Round 1 / Shortlisted).
- Table: checkbox (select-all in header), Team name, Team code, Members (count + names), Status chip. Selected rows highlighted in amber tint.
- Sticky bottom action bar (glass): "N teams selected", **Shortlist for Round 2**, **Remove from shortlist**. Both open a confirm dialog ("Shortlist N teams? All their members will get Round 2 unlocked.").
- Selection persists across pagination pages.

### 7.14 Admin: Event Controls (`/admin/event-controls`)
- **Countdown timer card:** fields Label (e.g. "Round 1 starts in"), Target date, Target time (IST), live preview using the participant countdown component, **Save timer**, **Clear timer**.
- **Round access card:** Round 1 toggle "Unlocked for all participants" (default off). Round 2 toggle "Visible to shortlisted teams" (default **on**, so shortlisting alone unlocks Round 2; switch it off to hold results back). Each toggle change requires a confirm dialog. Status pills Locked / Unlocked.

---

## 8. Business rules

### 8.1 Registration and identity
- One account per email. One profile per account. Registration number must be unique.
- Participant ID is generated once, server-side, format `PH26-00001`, from a database sequence. It never changes.

### 8.2 Team rules
- A participant can belong to **at most one team**, enforced by a database primary/unique key on `team_members.profile_id`.
- Team size: 1 – 3 including the lead. Solo teams are valid.
- **Create:** the lead sets the team name and may add up to 2 participants who are not in a team. Added members are placed in the team immediately (no acceptance step for now). Team code is generated on creation.
- **Join:** a participant with no team enters a valid code and joins immediately if the team has fewer than 3 members.
- After a participant is in a team, no leave, transfer, rename, swap or lead handover exists in the UI or API. Only admin can remove people or teams.
- All create/join operations must be atomic and race-safe (two people joining the last slot at the same time: exactly one succeeds).

### 8.3 Unlock rules
- **Round 1 tab** unlocks for a participant when `round1_unlocked = true` AND the participant is in a team.
- **Round 2 tab** unlocks when the participant's team is `shortlisted` AND `round2_open = true`.
- Removing a team from the shortlist re-locks Round 2 for all its members immediately.
- Unlock states refresh on the participant's screen within 30 seconds (polling or realtime) and on tab focus.

### 8.4 Admin removal rules
- **Remove team:** delete the team and its membership rows. Members become team-less and see the Create/Join options again. Their profiles stay.
- **Remove participant:** delete the profile and auth user (they must re-register). If they were in a team: remove them from it; if they were the lead and members remain, the earliest-joined member becomes lead; if they were the last member, delete the team. Admin dialog states this clearly.

---

## 9. Data model (Postgres / Supabase)

```sql
create sequence participant_seq start 1;

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  participant_id text unique not null
    default ('PH26-' || lpad(nextval('participant_seq')::text, 5, '0')),
  full_name text not null,
  reg_no text unique not null,
  college text not null,
  branch text not null,
  department text not null,
  section text not null,
  contact text not null,
  email text not null,
  created_at timestamptz default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code char(6) unique not null,
  lead_id uuid not null references profiles(id),
  status text not null default 'round1' check (status in ('round1','shortlisted')),
  created_at timestamptz default now()
);
create unique index teams_name_ci on teams (lower(name));

create table team_members (
  profile_id uuid primary key references profiles(id) on delete cascade, -- one team per person
  team_id uuid not null references teams(id) on delete cascade,
  role text not null check (role in ('lead','member')),
  joined_at timestamptz default now()
);

create table event_settings (
  id int primary key default 1 check (id = 1),
  countdown_label text,
  countdown_target timestamptz,
  round1_unlocked boolean not null default false,
  round2_open boolean not null default true
);
insert into event_settings default values;
```

- Team-size cap (max 3) is enforced inside transactional functions with `select ... for update` on the team row.
- Team code: generated from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, retried on collision.
- RLS: participants can read only their own profile and their own team + its members; all writes go through server functions/actions. Admin actions use the service role from server-only code.

---

## 10. Server operations (actions / API routes)

| Operation | Caller | Behavior |
|---|---|---|
| `completeProfile(data)` | Participant | Validate, insert profile, return participant ID |
| `searchParticipants(q)` | Participant (no team) | Up to 8 results: name, participant ID, college; excludes self and anyone in a team |
| `createTeam(name, memberProfileIds[])` | Participant (no team) | Atomic: validate, create team, code, lead + members |
| `lookupTeam(code)` | Participant (no team) | Returns team name, lead name, count, isFull (no member details) |
| `joinTeam(code)` | Participant (no team) | Atomic join with capacity check |
| `getDashboardState()` | Participant | Profile, team + members, countdown, round unlock flags |
| `adminLogin(id, password)` / `adminLogout()` | Admin | Cookie session, rate limited |
| `adminListParticipants(params)` / `adminListTeams(params)` | Admin | Search, filter, sort, paginate, CSV export |
| `adminRemoveParticipant(id)` / `adminRemoveTeam(id)` | Admin | Rules in 8.4 |
| `adminSetShortlist(teamIds[], shortlisted)` | Admin | Bulk update team status |
| `adminUpdateEventSettings(data)` | Admin | Countdown + toggles |

---

## 11. Security, validation, privacy
- Validate every input on the server with Zod; never trust the client (team size, "already in team", unlock state).
- Never expose email/contact to other participants. Search and join previews show minimal fields only.
- Admin session: httpOnly, secure, sameSite=strict cookie, signed, 8-hour expiry. Bcrypt password hash in env. Rate-limit login.
- CSRF-safe server actions; escape all user text; parameterized queries only.
- Admin routes and APIs must reject non-admin sessions even when called directly.
- Do not log passwords or tokens.

---

## 12. UX quality bar
- **States for every screen:** loading (skeletons in the same card shapes), empty (friendly message + icon), error (inline + toast), success.
- **Responsive:** design at 1440, 1024, 768, 390 px. Tables scroll horizontally inside their card on small screens; admin sidebar becomes a drawer.
- **Accessibility:** WCAG AA contrast, visible focus rings in amber, keyboard-operable modals with focus trap and Esc to close, `aria-live` for countdown updates every minute (not every second), labels on all inputs.
- **Performance:** landing page LCP under 2.5 s; fonts preloaded; no layout shift from the fixed navbar.
- **Copy:** short, friendly, no jargon.

---

## 13. Acceptance criteria (key flows)

1. **Register:** Given a visitor, when they click Register Now, they land on `/auth` with Create account selected. After sign up they are forced to `/profile/complete`; after submitting they see a unique `PH26-xxxxx` ID and reach `/dashboard`.
2. **Profile lock:** A submitted profile can't be edited anywhere; duplicate registration number is rejected with a clear message.
3. **No-team dashboard:** Shows greeting, ID, the one-time warning and the Create/Join cards only. Round 1 and Round 2 tabs show locks.
4. **Create team:** Lead can search by name or ID, add up to 2 people who are not in a team, gets a unique 6-character code, and the Create/Join UI disappears from their dashboard on next load. Added members also lose Create/Join immediately.
5. **Join team:** Valid code + capacity → joined; invalid code and full team show correct errors; two simultaneous joins for the last slot result in exactly one success.
6. **Dashboard with team:** Shows countdown from the admin setting (or "announced soon"), team code, and member list. No Create/Join anywhere.
7. **Round 1:** Locked until admin toggles it on; opens for all team members at once.
8. **Shortlisting:** Selecting teams and confirming unlocks Round 2 for every member of those teams within 30 seconds; un-shortlisting re-locks it.
9. **Admin tables:** Participants and Teams tables support search, filters, sorting, pagination, CSV export; removal follows Section 8.4 and updates participant views.
10. **Countdown:** Admin changes the target → participants see the new value without a redeploy; the timer matches server time regardless of device clock.
11. **Access control:** Direct URL access to admin routes without an admin session redirects to `/admin/login`; participant routes without a session redirect to `/auth`.
12. **Visual QA:** Every screen uses only tokens from Section 5, matches the landing page mood (obsidian background, amber accents, ambient glow, glass modals), and contains no elements outside this PRD.

---

## 14. Build plan (milestones for the agent)

1. **Foundation:** project setup, Tailwind config from the landing reference, fonts and icons, global layout, shared components (Navbar, Button, Input, Card, Modal, Chip, Table, Toast, Countdown, CodeInput).
2. **Landing page:** build to match the reference with the content changes in 7.1.
3. **Auth + profile:** Supabase auth (email/password + Google), guards, profile form, ID generation, success state.
4. **Participant dashboard:** no-team state, create/join modals with atomic server functions, with-team state, countdown component.
5. **Round pages:** locked/unlocked states and unlock logic.
6. **Admin:** login + session, shell, Participants, Teams, Shortlisting, Event Controls.
7. **Hardening:** seed script (about 20 participants, 6 teams in mixed sizes), edge cases, responsive pass, accessibility pass, README with setup steps, env example, and deployment notes.

**Definition of done:** all acceptance criteria in Section 13 pass, the app runs locally from the README in under 5 minutes, and no unlisted UI exists.

---

## 15. Open questions (defaults chosen; confirm later)

1. **Round 1 submissions:** the event requires a deck, GitHub repo and demo video. This PRD leaves the Round 1 page with placeholders. Suggested v1.1: three link fields (deck, repo, video) on `/round-1` for team members, editable until the deadline.
2. **Registration close:** registrations run Sep 28 – Oct 4. Default: no automatic close. Optional env `REGISTRATION_CLOSES_AT` disables Register Now afterwards.
3. **Added members' consent:** members added by the lead are placed in the team without confirmation (per current plan). Consider an accept step later.
4. **Round 2 toggle:** defaults to on so shortlisting alone unlocks Round 2. Turn it off in Event Controls to hold results until announcement time.
5. **Email verification:** off by default for speed. Turn on in Supabase if you want verified emails only.