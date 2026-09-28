export interface ProblemStatement {
  id: string; // e.g. "PS01"
  title: string;
  domain: string;
  domainSlug: string;
  shortDesc: string;
  description: string;
  keyDeliverables: string[];
  targetAudience: string;
  suggestedTech: string[];
  difficulty: "Beginner Friendly" | "Intermediate" | "Advanced";
}

export interface DomainCategory {
  slug: string;
  name: string;
  description: string;
  iconName: string;
}

export const DOMAIN_CATEGORIES: DomainCategory[] = [
  {
    slug: "all",
    name: "All Tracks",
    description: "Browse all official ProtoHack problem statements",
    iconName: "Layers",
  },
  {
    slug: "ai-systems",
    name: "AI & Intelligent Systems",
    description: "LLMs, vector search, assistive bots & autonomous agents",
    iconName: "Cpu",
  },
  {
    slug: "fintech-web3",
    name: "FinTech & Open Economy",
    description: "Split expenses, campus ledger, micro-payments & transparency",
    iconName: "Zap",
  },
  {
    slug: "health-assistive",
    name: "HealthTech & Assistive",
    description: "Offline triage, emergency dispatch & mental wellness networks",
    iconName: "ShieldCheck",
  },
  {
    slug: "smart-campus",
    name: "Smart Campus & EdTech",
    description: "Resource scheduling, visual lost & found, and student tools",
    iconName: "Terminal",
  },
  {
    slug: "sustainability",
    name: "Sustainability & Mobility",
    description: "Food waste redistribution, micro-carpooling & clean energy",
    iconName: "Sparkles",
  },
];

export const OFFICIAL_PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: "PS01",
    title: "AI Campus Study & Peer Collaborative Copilot",
    domain: "AI & Intelligent Systems",
    domainSlug: "ai-systems",
    difficulty: "Beginner Friendly",
    shortDesc: "Automated group revision scheduler with note-to-quiz synthesis and peer matching.",
    description: "Build an AI-assisted campus study workspace that organizes group revision schedules, synthesizes peer lecture notes into interactive flashcards/quizzes, and matches students with study buddies based on weak syllabus topics.",
    keyDeliverables: [
      "Semantic syllabus and lecture note indexing",
      "Automated multiple-choice & flashcard quiz generation",
      "Smart peer matchmaking based on topic proficiency",
      "Interactive group revision session timer & whiteboard",
    ],
    targetAudience: "1st & 2nd year students tackling heavy midterm syllabus workloads.",
    suggestedTech: ["Next.js 14", "TypeScript", "OpenAI / Gemini SDK", "Supabase", "Tailwind CSS"],
  },
  {
    id: "PS02",
    title: "Automated Code Review & Architecture Explainer for Beginners",
    domain: "AI & Intelligent Systems",
    domainSlug: "ai-systems",
    difficulty: "Intermediate",
    shortDesc: "Developer assistant that spots anti-patterns, explains code logic in analogies, and writes unit tests.",
    description: "An interactive developer tool that analyzes beginner Git pull requests, explains complex code blocks in simple analogies, spots security anti-patterns (e.g. exposed API keys, memory leaks), and generates unit tests automatically.",
    keyDeliverables: [
      "AST or regex-based code inspection parser",
      "Plain-language architectural explanation generator",
      "Automated unit test generation for edge cases",
      "Visual complexity breakdown chart",
    ],
    targetAudience: "Junior developers, hackathon participants, and coding bootcamp learners.",
    suggestedTech: ["React", "Node.js", "Tree-sitter / Babel Parser", "OpenAI API", "Monaco Editor"],
  },
  {
    id: "PS03",
    title: "Micro-Budgeting & Campus Split-Payment Settlement Engine",
    domain: "FinTech & Open Economy",
    domainSlug: "fintech-web3",
    difficulty: "Beginner Friendly",
    shortDesc: "Friction-free expense splitter with OCR receipt parsing and debt settlement minimization.",
    description: "A friction-free expense splitter and budget manager tailored for student roommates and club events that prevents debt creep, sends smart reminders, and supports offline receipt OCR breakdown with zero manual math.",
    keyDeliverables: [
      "Receipt image OCR parsing into itemized bill lines",
      "Debt-simplification graph algorithm (minimizes transaction count)",
      "Instant UPI deep-link generation for settlement",
      "Shared apartment / event budget forecast metrics",
    ],
    targetAudience: "Hostel roommates, student club organizers, and campus project teams.",
    suggestedTech: ["Next.js", "Tesseract.js / Google Cloud Vision", "Supabase", "Lucide React", "Chart.js"],
  },
  {
    id: "PS04",
    title: "Transparent Club Treasury & Micro-Grant Crowdfunding Platform",
    domain: "FinTech & Open Economy",
    domainSlug: "fintech-web3",
    difficulty: "Intermediate",
    shortDesc: "Verifiable milestone-driven funding platform for campus student projects and tech clubs.",
    description: "A verifiable platform for student technical clubs to publish budget allocations, run project crowdfunding with verifiable milestones, and issue tamper-proof digital certificates/receipts to sponsors.",
    keyDeliverables: [
      "Public milestone approval ledger with evidence attachments",
      "Transparent multi-signature voting / club coordinator sign-offs",
      "Downloadable cryptographic audit receipts for sponsors",
      "Real-time treasury expenditure graphs",
    ],
    targetAudience: "Student clubs, robotics teams, hackathon organizers, and alumni sponsors.",
    suggestedTech: ["Next.js 14", "TypeScript", "PostgreSQL", "Tailwind CSS", "PDF-Lib"],
  },
  {
    id: "PS05",
    title: "Low-Bandwidth Rural Clinic & Triage Queue Coordinator",
    domain: "HealthTech & Assistive",
    domainSlug: "health-assistive",
    difficulty: "Beginner Friendly",
    shortDesc: "Offline-first triage coordination system with priority emergency scoring.",
    description: "An offline-first digital triage portal that allows community health workers to log vital signs, prioritize patient queues, and sync data seamlessly when connectivity is restored, with zero patient record loss.",
    keyDeliverables: [
      "Offline-first IndexedDB database storage with background auto-sync",
      "Standard triage color-code categorization (Red / Yellow / Green)",
      "Prescription summary PDF generator with localized language headers",
      "SMS broadcast notifications for patient queue status",
    ],
    targetAudience: "Community health camps, rural clinics, and campus medical response centers.",
    suggestedTech: ["PWA (Progressive Web App)", "IndexedDB / Dexie.js", "React", "Supabase", "Service Workers"],
  },
  {
    id: "PS06",
    title: "Campus Mental Wellness & Anonymous Peer Support Network",
    domain: "HealthTech & Assistive",
    domainSlug: "health-assistive",
    difficulty: "Beginner Friendly",
    shortDesc: "Safe, anonymous peer-listener matchmaking with crisis trigger escalation.",
    description: "An anonymous peer support matching platform with sentiment-aware check-ins, automated crisis resource alerts, and guided mindfulness break schedules without collecting identifiable personal records.",
    keyDeliverables: [
      "Ephemeral end-to-end encrypted anonymous chat channels",
      "Automated distress sentiment detection and emergency counselor escalation",
      "Daily wellness streak tracker and guided audio breathing exercises",
      "Zero-retention chat privacy architecture",
    ],
    targetAudience: "College students dealing with exam stress, burnout, and campus anxiety.",
    suggestedTech: ["Next.js", "WebSockets / WebRTC", "Supabase Realtime", "Tailwind CSS"],
  },
  {
    id: "PS07",
    title: "Dynamic Campus Resource, Room & Lab Allocation Engine",
    domain: "Smart Campus & EdTech",
    domainSlug: "smart-campus",
    difficulty: "Beginner Friendly",
    shortDesc: "Real-time calendar conflict resolution for classrooms, lab rigs, and club venues.",
    description: "Solve campus classroom and specialized lab booking chaos with real-time slot conflict resolution, QR check-ins, faculty advisor approvals, and automated equipment maintenance schedules.",
    keyDeliverables: [
      "Interactive 2D/grid visual calendar with instant conflict avoidance",
      "QR code check-in validation to prevent ghost-booking of venues",
      "Multi-stage approval workflow for student clubs and faculty",
      "Lab hardware inventory checkout log",
    ],
    targetAudience: "Faculty coordinators, lab assistants, and student project heads.",
    suggestedTech: ["React", "Supabase", "Tailwind CSS", "FullCalendar / Custom Grid", "QRCode.react"],
  },
  {
    id: "PS08",
    title: "Decentralized Lost-and-Found with Visual AI Similarity Search",
    domain: "Smart Campus & EdTech",
    domainSlug: "smart-campus",
    difficulty: "Intermediate",
    shortDesc: "Snap a photo of found items to match lost item claims via visual embeddings.",
    description: "A campus lost-and-found system where users snap a photo of found items (ID cards, bottles, calculators, laptops), and the system performs visual feature extraction and automatically notifies potential owners.",
    keyDeliverables: [
      "Image upload with automated category classification & color tagging",
      "Visual similarity matching score between Lost vs Found posts",
      "Secure claim verification quiz (e.g. wallpaper description, serial number)",
      "Instant WhatsApp/Email notification upon high similarity match",
    ],
    targetAudience: "Campus security offices, hostel wardens, and 10,000+ campus residents.",
    suggestedTech: ["Next.js 14", "Python / CLIP / MobileNet", "Supabase Storage", "Tailwind CSS"],
  },
  {
    id: "PS09",
    title: "Campus Micro-Carpooling & Electric Shuttle Route Tracker",
    domain: "Sustainability & Mobility",
    domainSlug: "sustainability",
    difficulty: "Intermediate",
    shortDesc: "Safe, verified peer ride-sharing and live campus shuttle route tracker.",
    description: "Connect day-scholar students and faculty traveling identical routes for safe, verified micro-carpooling and campus shuttle tracking to slash single-occupancy vehicle emissions.",
    keyDeliverables: [
      "Verified college domain authentication for driver & rider safety",
      "Route waypoint matching within a 2km corridor",
      "Emergency SOS button and live ride status sharing",
      "Carbon savings badge counter per completed carpool",
    ],
    targetAudience: "Day scholar students, commuters, and campus security coordinators.",
    suggestedTech: ["Next.js", "Mapbox GL / Leaflet", "Supabase Realtime", "Tailwind CSS"],
  },
  {
    id: "PS10",
    title: "Smart Mess Food Waste Tracker & Redistribution Engine",
    domain: "Sustainability & Mobility",
    domainSlug: "sustainability",
    difficulty: "Beginner Friendly",
    shortDesc: "Attendance-based mess meal forecasting and surplus meal donation dispatch.",
    description: "A real-time food analytics dashboard for college messes to forecast meal counts based on daily student attendance and channel surplus meals to verified local shelters before expiry.",
    keyDeliverables: [
      "Daily student meal attendance check-in / opt-out toggles",
      "Predictive meal preparation calculator to minimize overcooking",
      "Real-time surplus food listing with temperature & preparation timestamp",
      "Volunteer pickup coordination dispatch log",
    ],
    targetAudience: "Hostel mess contractors, student welfare teams, and local charity partners.",
    suggestedTech: ["Next.js 14", "Chart.js", "Supabase", "Tailwind CSS", "WhatsApp Webhook"],
  },
];

export function getProblemStatementById(id: string): ProblemStatement | undefined {
  return OFFICIAL_PROBLEM_STATEMENTS.find((ps) => ps.id.toUpperCase() === id.toUpperCase());
}
