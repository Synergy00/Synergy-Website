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
    slug: "ai-ml",
    name: "AI & ML",
    description: "Intelligent systems, image diagnosis, and predictive analytics",
    iconName: "Cpu",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Health monitoring, nutritional coaching, outbreak mapping",
    iconName: "ShieldCheck",
  },
  {
    slug: "education",
    name: "Education",
    description: "Scholarship management, interactive learning, study assistants",
    iconName: "BookOpen",
  },
  {
    slug: "disaster-management",
    name: "Disaster Management",
    description: "Risk awareness, flood warnings, preparedness trackers",
    iconName: "AlertTriangle",
  },
  {
    slug: "smart-automation",
    name: "Smart Automation",
    description: "Data harmonization, industry mapping, monitoring systems",
    iconName: "Settings",
  },
];

export const OFFICIAL_PROBLEM_STATEMENTS: ProblemStatement[] = [
  // ================= AI & ML =================
  {
    id: "PS01",
    title: "Medical Image Diagnosis System",
    domain: "AI & ML",
    domainSlug: "ai-ml",
    difficulty: "Advanced",
    shortDesc: "A CNN-based model that detects and classifies anomalies in medical images.",
    description: "A CNN-based model that detects and classifies anomalies in medical images such as X-rays, helping identify conditions like pneumonia, tumors, and fractures faster and more accurately.",
    keyDeliverables: [
      "Image upload and preprocessing pipeline",
      "Anomaly detection and classification model",
      "Detailed visual report generation",
    ],
    targetAudience: "Healthcare professionals and diagnostic centers.",
    suggestedTech: ["Python", "TensorFlow/PyTorch", "React", "FastAPI"],
  },
  {
    id: "PS02",
    title: "Sentiment Analysis for Mental Health Monitoring",
    domain: "AI & ML",
    domainSlug: "ai-ml",
    difficulty: "Intermediate",
    shortDesc: "An NLP model that analyzes text for signs of stress and depression.",
    description: "An NLP model that analyzes text messages or posts for signs of stress, anxiety, or depression and alerts users or their trusted contacts so timely support can be offered.",
    keyDeliverables: [
      "Text processing and sentiment classification",
      "Alert notification system",
      "Dashboard for trusted contacts",
    ],
    targetAudience: "Individuals seeking mental health support and their care networks.",
    suggestedTech: ["Python", "Transformers (HuggingFace)", "Next.js", "Supabase"],
  },
  {
    id: "PS03",
    title: "Energy Usage Prediction and Optimization",
    domain: "AI & ML",
    domainSlug: "ai-ml",
    difficulty: "Intermediate",
    shortDesc: "An AI system that predicts energy consumption and gives cost-saving recommendations.",
    description: "An AI system that predicts energy consumption in homes or institutions and gives simple recommendations to reduce waste, lower costs, and promote sustainability.",
    keyDeliverables: [
      "Time-series prediction model",
      "Actionable recommendation engine",
      "Energy usage dashboard",
    ],
    targetAudience: "Homeowners and institutional facility managers.",
    suggestedTech: ["Python", "Scikit-learn", "React", "Node.js"],
  },

  // ================= HEALTHCARE =================
  {
    id: "PS04",
    title: "Affordable Remote Health Monitoring for Rural Areas",
    domain: "Healthcare",
    domainSlug: "healthcare",
    difficulty: "Beginner Friendly",
    shortDesc: "A low-cost system to track vital signs of people in rural areas.",
    description: "A low-cost system that tracks vital signs of people in rural areas and lets healthcare professionals view patient data remotely and step in on time.",
    keyDeliverables: [
      "Patient vital logging interface",
      "Doctor remote viewing dashboard",
      "Critical condition alert system",
    ],
    targetAudience: "Rural patients and remote healthcare workers.",
    suggestedTech: ["React Native", "Next.js", "Supabase", "Tailwind CSS"],
  },
  {
    id: "PS05",
    title: "Nutritional Coaching App for Maternal and Child Health",
    domain: "Healthcare",
    domainSlug: "healthcare",
    difficulty: "Beginner Friendly",
    shortDesc: "Customized nutrition guidance and recipes for pregnant women and young children.",
    description: "An app that gives customized nutrition guidance and recipes for pregnant women and young children to help address malnutrition and improve health outcomes.",
    keyDeliverables: [
      "Personalized nutrition assessment",
      "Recipe recommendation engine",
      "Daily milestone tracker",
    ],
    targetAudience: "Mothers, pregnant women, and community health workers.",
    suggestedTech: ["Flutter", "Firebase", "Node.js"],
  },
  {
    id: "PS06",
    title: "Predictive Disease Outbreak Mapping and Alert System",
    domain: "Healthcare",
    domainSlug: "healthcare",
    difficulty: "Advanced",
    shortDesc: "Predicts disease outbreaks using climate, population, and local health data.",
    description: "A data-driven application that predicts disease outbreaks using climate, population movement, and local health data, and alerts communities and health authorities about potential risks.",
    keyDeliverables: [
      "Data ingestion pipeline for environmental metrics",
      "Interactive risk map visualization",
      "Automated SMS/Email alert dispatcher",
    ],
    targetAudience: "Public health authorities and local communities.",
    suggestedTech: ["Python", "Mapbox/Leaflet", "Next.js", "PostgreSQL"],
  },

  // ================= EDUCATION =================
  {
    id: "PS07",
    title: "AI-Enabled Scholarship and Fellowship Management System for Scheduled Tribes",
    domain: "Education",
    domainSlug: "education",
    difficulty: "Intermediate",
    shortDesc: "Platform helping ST students discover scholarships and track applications.",
    description: "A platform that helps Scheduled Tribe students discover eligible scholarships, track applications and deadlines, and lets officials verify documents and monitor disbursement with AI support.",
    keyDeliverables: [
      "Scholarship discovery and filtering portal",
      "Document upload and AI OCR verification",
      "Application status tracking dashboard",
    ],
    targetAudience: "ST Students and government educational officials.",
    suggestedTech: ["Next.js", "Tailwind CSS", "Tesseract.js / AWS Textract", "Supabase"],
  },
  {
    id: "PS08",
    title: "AI-Based Interactive Quantum Algorithm Learning Platform",
    domain: "Education",
    domainSlug: "education",
    difficulty: "Advanced",
    shortDesc: "Interactive learning platform with visual simulations and AI tutor for quantum algorithms.",
    description: "An interactive learning platform that explains quantum algorithms through visual simulations and step-by-step guidance, with an AI tutor to clear doubts for beginners.",
    keyDeliverables: [
      "Visual quantum circuit simulator",
      "Interactive step-by-step tutorials",
      "Integrated AI chatbot for doubts",
    ],
    targetAudience: "Computer science students and quantum computing beginners.",
    suggestedTech: ["React", "Three.js/Canvas", "OpenAI API", "Python"],
  },
  {
    id: "PS09",
    title: "AI-Powered Personalized Study Assistant",
    domain: "Education",
    domainSlug: "education",
    difficulty: "Beginner Friendly",
    shortDesc: "Auto-generates summaries, flashcards, and quizzes from uploaded notes.",
    description: "A tool where students upload notes or PDFs and receive auto-generated summaries, flashcards, and practice quizzes tailored to their learning pace.",
    keyDeliverables: [
      "PDF parsing and text extraction",
      "Automated summary and flashcard generation",
      "Spaced repetition quiz interface",
    ],
    targetAudience: "School and university students.",
    suggestedTech: ["Next.js", "LangChain", "OpenAI", "PostgreSQL"],
  },

  // ================= DISASTER MANAGEMENT =================
  {
    id: "PS10",
    title: "Disaster Risk Awareness Chatbot",
    domain: "Disaster Management",
    domainSlug: "disaster-management",
    difficulty: "Beginner Friendly",
    shortDesc: "Chatbot providing safety instructions before, during, and after disasters.",
    description: "A chatbot that tells citizens what to do before, during, and after a disaster, giving clear and simple safety instructions on demand.",
    keyDeliverables: [
      "Conversational chatbot interface",
      "Multilingual support capability",
      "Offline fallback or low-bandwidth design",
    ],
    targetAudience: "General public in disaster-prone regions.",
    suggestedTech: ["React", "Dialogflow / Rasa", "Node.js"],
  },
  {
    id: "PS11",
    title: "Hyperlocal Urban Flood Early Warning System",
    domain: "Disaster Management",
    domainSlug: "disaster-management",
    difficulty: "Intermediate",
    shortDesc: "Predicts flooding at street level using rainfall/water-level data.",
    description: "A system that uses rainfall and water-level data to predict flooding at street or locality level and sends early alerts to residents and authorities.",
    keyDeliverables: [
      "IoT/sensor data ingestion",
      "Hyperlocal prediction mapping",
      "Push notification alerting system",
    ],
    targetAudience: "Urban residents and municipal authorities.",
    suggestedTech: ["Python", "Next.js", "WebSockets", "Firebase"],
  },
  {
    id: "PS12",
    title: "Earthquake/Landslide Preparedness Tracker for Coastal Villages",
    domain: "Disaster Management",
    domainSlug: "disaster-management",
    difficulty: "Intermediate",
    shortDesc: "Helps coastal villages monitor preparedness and emergency gaps.",
    description: "A tracker that helps coastal villages monitor their preparedness, such as safe zones, emergency kits, and drill status, and highlights gaps that need attention.",
    keyDeliverables: [
      "Village-level preparedness dashboard",
      "Checklist and audit tracking system",
      "Gap analysis reporting",
    ],
    targetAudience: "Village leaders and local disaster management agencies.",
    suggestedTech: ["Next.js", "Supabase", "Tailwind CSS"],
  },

  // ================= SMART AUTOMATION =================
  {
    id: "PS13",
    title: "Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management",
    domain: "Smart Automation",
    domainSlug: "smart-automation",
    difficulty: "Advanced",
    shortDesc: "Automatically merges land data into one consistent map-based record.",
    description: "A tool that automatically merges land data from different sources and formats into one consistent, error-free map-based record for easier urban land management.",
    keyDeliverables: [
      "Geospatial data normalization pipeline",
      "Conflict resolution algorithm",
      "Interactive map-based UI",
    ],
    targetAudience: "Urban planners and land registry departments.",
    suggestedTech: ["Python", "PostGIS", "React", "Mapbox"],
  },
  {
    id: "PS14",
    title: "Portal for Academia-Industry Collaboration for Skill Mapping, Internships and Placement",
    domain: "Smart Automation",
    domainSlug: "smart-automation",
    difficulty: "Intermediate",
    shortDesc: "Maps student skills to industry requirements and connects them with opportunities.",
    description: "A portal that maps student skills to industry requirements and connects students with internships and placement opportunities while letting companies collaborate with institutions.",
    keyDeliverables: [
      "Skill mapping algorithm",
      "Student and Company profiles",
      "Automated matchmaking dashboard",
    ],
    targetAudience: "University students, placement cells, and hiring companies.",
    suggestedTech: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
  },
  {
    id: "PS15",
    title: "Pothole Complaint and Monitoring System",
    domain: "Smart Automation",
    domainSlug: "smart-automation",
    difficulty: "Beginner Friendly",
    shortDesc: "App for citizens to report potholes and officials to track repairs.",
    description: "An application where citizens report potholes with location and photos, and officials track complaint status, prioritize repairs, and analyze past data to find recurring problem areas.",
    keyDeliverables: [
      "Citizen mobile-friendly reporting form with GPS",
      "Official dashboard for status tracking",
      "Analytics view for recurring issues",
    ],
    targetAudience: "Citizens and municipal road maintenance departments.",
    suggestedTech: ["React Native / PWA", "Next.js", "Supabase Storage", "Google Maps API"],
  },
];

export function getProblemStatementById(id: string): ProblemStatement | undefined {
  return OFFICIAL_PROBLEM_STATEMENTS.find((ps) => ps.id === id);
}
