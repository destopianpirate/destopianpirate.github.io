// All portfolio content for the v2 site. Mirrors the data in src/App.jsx (the original site),
// kept JSX-free so any v2 page or the 3D scene can import it.
import logoLight from '../../assets/logo_light.png';
import logoZeroGpt from '../../assets/logo-zerogpt.png';
import logoAssignmentAI from '../../assets/assignmentai.svg';
import logoCompressor from '../../assets/compressor-logo.svg';
import logoQs from '../../assets/qs_logo.png';
import logoFamShield from '../../assets/famshield_logo.png';
import logoCloudforge from '../../assets/cloudforge_logo.png';
import logoOctrops from '../../assets/octrops_logo.png';
import logoManthan from '../../assets/manthan_logo.png';
import profile from '../../assets/profile.png';

export const PROFILE_IMG = profile;

export const ME = {
  name: 'Ayush Singh',
  first: 'AYUSH',
  last: 'SINGH',
  kana: 'アユシュ・シン',
  role: 'AI & Full-Stack Engineer',
  school: 'IIT Gandhinagar',
  degree: 'B.Tech in Artificial Intelligence',
  since: 'Entered 2025',
  email: 'ayushspna4040@gmail.com',
  mailto: 'https://mail.google.com/mail/?view=cm&fs=1&to=ayushspna4040@gmail.com',
  github: 'https://github.com/destopianpirate',
  githubHandle: 'destopianpirate',
  linkedin: 'https://linkedin.com/in/ayushxphoenix',
  linkedinHandle: 'ayushxphoenix',
  campus: 'IIT Gandhinagar, Gujarat',
  campusMap: 'https://www.google.com/maps/search/?api=1&query=IIT+Gandhinagar+Gujarat',
  home: 'Prayagraj, UP',
  homeMap: 'https://www.google.com/maps/search/?api=1&query=Prayagraj+Uttar+Pradesh',
};

export const BIO = {
  heading: 'Intelligence, engineered into interfaces.',
  // [text, highlighted?] runs so the page can mark key phrases
  body: [
    ['I design and engineer intelligent applications at the intersection of '],
    ['Artificial Intelligence', true],
    [' and '],
    ['Full-Stack Web Development', true],
    ['. I focus on translating complex '],
    ['neural networks', true],
    [' into beautiful, responsive, and '],
    ['production-ready', true],
    [' interfaces, bridging the gap between machine learning models and user-friendly software architectures.'],
  ],
  closer: "Let's build something intelligent. Exploring ways to merge deep learning software with scalable systems and modern frontend aesthetics.",
};

export const PILLARS = [
  {
    title: 'Artificial Intelligence',
    tag: 'AI / ML',
    kanji: '知',
    reading: 'chi · wisdom',
    desc: 'Designing neural networks, vision OCR systems, and generative study intelligence.',
    stats: [['PyTorch', 90], ['Vision', 88], ['LLMs', 92]],
  },
  {
    title: 'Systems Engineering',
    tag: 'Systems',
    kanji: '構',
    reading: 'kō · structure',
    desc: 'Deploying high-performance containerized software pipelines and automated DevOps workflows.',
    stats: [['Docker', 82], ['Rust', 78], ['CI/CD', 85]],
  },
  {
    title: 'Full-Stack Web',
    tag: 'Web App',
    kanji: '創',
    reading: 'sō · creation',
    desc: 'Engineering premium, glassmorphic interfaces and scalable backend services.',
    stats: [['React', 92], ['Node', 88], ['Motion', 88]],
  },
];

export const TIMELINE = [
  {
    date: 'July 2025 - Present',
    title: 'B.Tech in Artificial Intelligence',
    institution: 'IIT Gandhinagar',
    desc: 'Pursuing specialized studies in deep learning pipelines, edge computing optimizations, computer vision, and scalable intelligent web applications.',
    kanji: '学',
    arc: 'The Engineer Arc',
  },
  {
    date: 'June 2023 - March 2024',
    title: 'Class XII (CBSE Board)',
    institution: 'Gurukul Academy, Lucknow',
    desc: 'Completed secondary education scoring 95.2% aggregate. Focused on Advanced Mathematics, Physics, and Chemistry.',
    score: 95.2,
    kanji: '理',
    arc: 'The Science Arc',
  },
  {
    date: 'June 2021 - March 2022',
    title: 'Class X (CBSE Board)',
    institution: 'Gurukul Academy, Lucknow',
    desc: 'Completed high school studies scoring 97.4% aggregate.',
    score: 97.4,
    kanji: '始',
    arc: 'The Origin Arc',
  },
];

// category drives the filter on /projects2/; radar is the per-project focus profile from the original site
export const PROJECTS = [
  {
    slug: 'octrops',
    title: 'Octrops Code',
    category: 'AI',
    stack: ['TypeScript', 'VS Code API', 'Gemini AI', 'Node.js', 'AI APIs'],
    desc: 'A serverless AI coding assistant and developer extension for VS Code and Antigravity IDE. Connects directly to 17+ LLM providers with zero telemetry, multi-file codebase indexing, interactive code explanations, and privacy-first local API routing.',
    features: [
      'Multi-provider LLM gateway supporting Gemini 2.0, Groq, OpenRouter, and NVIDIA NIM',
      'Privacy-first architecture running locally with zero intermediary telemetry or data retention',
      'Context-aware codebase indexing and semantic search for multi-file code generation',
      'Interactive sidebar chat, inline code refactoring, and automated diff previewer',
      'Custom API Extender gateway with automatic rate-limit cooldowns and multi-key fallback',
    ],
    liveUrl: 'https://octrops.vercel.app',
    repoUrl: 'https://github.com/destopianpirate/destopian-octrops',
    logo: logoOctrops,
    radar: { 'AI / ML': 96, Frontend: 88, Backend: 85, Databases: 55, DevOps: 75, Systems: 92 },
  },
  {
    slug: 'manthan',
    title: 'Manthan (SCIF)',
    category: 'Web',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'TypeScript'],
    desc: 'A state-scale Societal Innovation Collaboration Platform (SICP) engineered for Smart India Hackathon (Problem Statement 43). Crowdsources grassroots societal challenges, automates AI-driven triage, matches university R&D research labs, and accelerates corporate CSR sponsorships.',
    features: [
      'State-scale grassroots problem crowdsourcing engine with AI-assisted categorization',
      'Automated R&D laboratory matching algorithm pairing researchers with community challenges',
      'Corporate CSR sponsorship acceleration portal with transparent fund milestone tracking',
      'Multi-tenant Supabase PostgreSQL architecture with connection pooling and RBAC security',
      'High-performance Next.js 16 App Router interface built with Tailwind CSS v4 and responsive telemetry',
    ],
    liveUrl: 'https://github.com/destopianpirate/scif_b',
    repoUrl: 'https://github.com/destopianpirate/scif_b',
    logo: logoManthan,
    radar: { 'AI / ML': 55, Frontend: 92, Backend: 88, Databases: 90, DevOps: 80, Systems: 75 },
  },
  {
    slug: 'cloudforge',
    title: 'CloudForge',
    category: 'Systems',
    stack: ['Python', 'FastAPI', 'Docker', 'Rust', 'React', 'SQLite'],
    desc: 'A high-performance Backend-as-a-Service (BaaS) and cloud infrastructure platform designed for zero-cost unlimited storage and serverless databases. Features a custom Rust MTProto storage bridge, dynamic SQLite database hibernation, and an intuitive developer dashboard.',
    features: [
      'Custom Rust storage daemon (CFDrive) bridging HTTP requests to encrypted cloud channels',
      'Serverless SQLite database engine with intelligent auto-hibernation and instant warm-up',
      'Full-featured developer dashboard with real-time API metrics, keys, and bucket management',
      'Multi-tenant authentication system with fine-grained RBAC and rate-limiting middleware',
      'Containerized deployment architecture orchestrated via Docker Compose and microservices',
    ],
    liveUrl: 'https://cloudforge-frontend-psi.vercel.app',
    repoUrl: 'https://github.com/destopianpirate',
    logo: logoCloudforge,
    radar: { 'AI / ML': 25, Frontend: 80, Backend: 95, Databases: 90, DevOps: 94, Systems: 96 },
  },
  {
    slug: 'acadx',
    title: 'AcadX (student_portal)',
    category: 'Web',
    stack: ['React', 'Vite', 'Framer Motion', 'Custom CSS'],
    desc: 'A sleek, glassmorphic academic planner and student workspace to manage university life. It coordinates coursework, monitors attendance, and calculates real-time academic standing.',
    features: [
      'Synced timetables and calendar scheduling',
      'University holidays registry integration',
      'Automatic course conflict detection systems',
      'Dynamic GPA & attendance trackers',
      'Integrated Gemini AI study companion for personalized learning support',
    ],
    liveUrl: 'https://stuiit.vercel.app',
    repoUrl: 'https://github.com/destopianpirate',
    logo: logoLight,
    radar: { 'AI / ML': 40, Frontend: 95, Backend: 70, Databases: 80, DevOps: 60, Systems: 50 },
  },
  {
    slug: 'qs-iitgn',
    title: 'QS IITGN',
    category: 'Web',
    stack: ['HTML/CSS', 'JavaScript', 'GSAP'],
    desc: 'The official interactive web platform for the Quizzing Society of IIT Gandhinagar. Designed to host daily trivia challenges, manage society events, and catalog campus quiz archives.',
    features: [
      'Interactive Daily Challenge trivia engine with animated countdowns',
      'On This Day historical timeline dynamically generated from local JSON databases',
      'Cinematic GSAP entrance choreographies and scroll-triggered transitions',
      'Context-aware interactive mascot (Quizby) providing dynamic trivia feedback',
      'Progressive Web App (PWA) configurations with offline assets caching',
    ],
    liveUrl: 'https://destopianpirate.github.io/qs_iitgn/',
    repoUrl: 'https://github.com/destopianpirate/qs_iitgn',
    logo: logoQs,
    radar: { 'AI / ML': 10, Frontend: 95, Backend: 40, Databases: 30, DevOps: 50, Systems: 40 },
  },
  {
    slug: 'assignmentai',
    title: 'AssignmentAI',
    category: 'AI',
    stack: ['React', 'Gemini AI', 'Python', 'Vite'],
    desc: 'A high-performance, vision-capable educational helper that reads, analyzes, and explains math and computer science assignments directly from files.',
    features: [
      'Vision-capable OCR solving for handwritten and digital equations',
      'Fast client-side PDF document export & formatting',
      'Detailed step-by-step mathematical reasoning explanations',
      'Interactive AI tutor chat interface for real-time concept questions',
    ],
    liveUrl: 'https://asignmentai.vercel.app',
    logo: logoAssignmentAI,
    radar: { 'AI / ML': 95, Frontend: 85, Backend: 80, Databases: 40, DevOps: 60, Systems: 70 },
  },
  {
    slug: 'famshield',
    title: 'FamShield',
    category: 'Mobile',
    stack: ['React Native', 'Expo', 'Firebase', 'TypeScript'],
    desc: 'A cross-platform mobile application designed for real-time family safety, device telemetry tracking, and remote parent administration. Built with a Firebase backend, it coordinates real-time location mapping and remote command executions.',
    features: [
      'Real-time location tracking and geo-fencing overlays powered by React Native Maps',
      'Comprehensive device telemetry reporting including battery level, volume, and connection states',
      'Low-latency remote command listener execution system utilizing Firebase Firestore',
      'Custom native power management modules and overlay integration via Expo modules',
      'Secure client-side pairing system separating parent dashboards from child terminals',
    ],
    logo: logoFamShield,
    radar: { 'AI / ML': 20, Frontend: 80, Backend: 85, Databases: 75, DevOps: 60, Systems: 90 },
  },
  {
    slug: 'roadguard',
    title: 'RoadGuard AI',
    category: 'AI',
    stack: ['YOLOv8', 'Python', 'Google Maps API', 'GPS'],
    desc: 'An Edge AI traffic safety application deploying real-time computer vision models to detect and report road infrastructure defects.',
    features: [
      'YOLOv8 object detection model integration for anomalies',
      'Precise GPS coordinate mapping for road defects',
      'Automated system to sync coordinates with Google Maps API',
      'Real-time processing dashboard for infrastructure logs',
    ],
    glyph: 'target',
    radar: { 'AI / ML': 95, Frontend: 40, Backend: 75, Databases: 50, DevOps: 60, Systems: 90 },
  },
  {
    slug: 'zerogpti',
    title: 'ZeroGPTi',
    category: 'AI',
    stack: ['React', 'Vite', 'NLP APIs', 'Vanilla CSS'],
    desc: 'An advanced content analysis system built to inspect, identify, and report machine-generated or paraphrased text.',
    features: [
      'Proprietary grading scales for AI-generated sentence structures',
      'Deep natural language pattern analysis logs',
      'Interactive highlighter showing AI vs human written paragraphs',
    ],
    liveUrl: 'https://zerogpti.vercel.app',
    logo: logoZeroGpt,
    radar: { 'AI / ML': 90, Frontend: 70, Backend: 60, Databases: 30, DevOps: 40, Systems: 65 },
  },
  {
    slug: 'iot-dashboard',
    title: 'IoT Dashboard',
    category: 'Systems',
    stack: ['React', 'Vite', 'Tailwind CSS', 'WebSockets/MQTT', 'Chart.js'],
    desc: 'A professional real-time telemetry dashboard designed for large-scale sensor network configuration and graphical event log visualization.',
    features: [
      'Real-time sensor telemetry streaming over WebSockets & MQTT',
      'Highly interactive widgets (dials, live line graphs, grid status controls)',
      'Automated system alerts and threshold breach logs',
      'Comprehensive device connection logs & diagnostic telemetry',
    ],
    glyph: 'grid',
    radar: { 'AI / ML': 30, Frontend: 80, Backend: 90, Databases: 70, DevOps: 60, Systems: 85 },
  },
  {
    slug: 'imagepress',
    title: 'ImagePress - Image Compressor',
    category: 'Systems',
    stack: ['Python', 'Flask', 'Pillow', 'HTML/CSS'],
    desc: 'A lightning-fast web service that handles media optimization, file size compression, and instant conversion between next-gen image formats.',
    features: [
      'High-ratio image optimization preserving high resolution',
      'Supports WebP, PNG, JPG, and AVIF image compression pipelines',
      'Batch upload capabilities and quick download links',
    ],
    liveUrl: 'https://imagepresss.vercel.app',
    logo: logoCompressor,
    radar: { 'AI / ML': 20, Frontend: 70, Backend: 90, Databases: 40, DevOps: 70, Systems: 80 },
  },
];

export const FEATURED = ['octrops', 'manthan', 'cloudforge', 'acadx', 'qs-iitgn', 'assignmentai', 'famshield']
  .map((s) => PROJECTS.find((p) => p.slug === s));

export const PROJECT_CATEGORIES = ['All', 'AI', 'Web', 'Systems', 'Mobile'];

export const RADAR_AXES = ['AI / ML', 'Frontend', 'Backend', 'Databases', 'DevOps', 'Systems'];

export const CORE_FOCUS = { 'AI / ML': 90, Frontend: 92, Backend: 85, Databases: 86, DevOps: 85, Systems: 88 };

/** The axis a project leans on hardest: shown as its "element" on cards. */
export const primaryAxis = (p) => RADAR_AXES.reduce((best, a) => (p.radar[a] > p.radar[best] ? a : best), RADAR_AXES[0]);

export const SKILLS = [
  {
    category: 'Programming Languages',
    jp: '言語',
    icon: 'terminal',
    items: [
      { name: 'Python (AI/ML & Flask)', level: 95, logo: 'https://cdn.simpleicons.org/python/3776AB' },
      { name: 'JavaScript / ES6+', level: 90, logo: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      { name: 'TypeScript', level: 85, logo: 'https://cdn.simpleicons.org/typescript/3178C6' },
      { name: 'C++ (Edge AI Systems)', level: 80, logo: 'https://cdn.simpleicons.org/cplusplus/00599C' },
    ],
  },
  {
    category: 'Frontend Development',
    jp: '前端',
    icon: 'code',
    items: [
      { name: 'React (Hooks & Context)', level: 92, logo: 'https://cdn.simpleicons.org/react/61DAFB' },
      { name: 'CSS (Vanilla & Flex/Grid)', level: 95, logo: 'https://cdn.simpleicons.org/css/1572B6' },
      { name: 'HTML5 / CSS3 (Aesthetics)', level: 95, logo: 'https://cdn.simpleicons.org/html5/E34F26' },
      { name: 'Framer Motion', level: 88, logo: 'https://cdn.simpleicons.org/framer/0055FF' },
    ],
  },
  {
    category: 'Backend & Systems',
    jp: '後端',
    icon: 'server',
    items: [
      { name: 'Node.js (Express)', level: 88, logo: 'https://cdn.simpleicons.org/nodedotjs/339933' },
      { name: 'Django (Robust APIs)', level: 82, logo: 'https://cdn.simpleicons.org/django/092E20' },
      { name: 'Flask (Microservices)', level: 85, logo: 'https://cdn.simpleicons.org/flask/000000' },
      { name: 'High-Performance Systems', level: 80, logo: null },
    ],
  },
  {
    category: 'Databases & Storage',
    jp: '記憶',
    icon: 'database',
    items: [
      { name: 'Supabase (PostgreSQL & Auth)', level: 86, logo: 'https://cdn.simpleicons.org/supabase/3ECF8E' },
      { name: 'Firebase (Realtime DB & Auth)', level: 85, logo: 'https://cdn.simpleicons.org/firebase/FFCA28' },
    ],
  },
  {
    category: 'Edge AI & Computer Vision',
    jp: '視覚',
    icon: 'cpu',
    items: [
      { name: 'PyTorch Deep Learning', level: 90, logo: 'https://cdn.simpleicons.org/pytorch/EE4C2C' },
      { name: 'TensorFlow Engine', level: 82, logo: 'https://cdn.simpleicons.org/tensorflow/FF6F00' },
      { name: 'Scikit-Learn ML', level: 88, logo: 'https://cdn.simpleicons.org/scikitlearn/F7931E' },
      { name: 'YOLOv8 Edge Implementations', level: 88, logo: 'https://cdn.simpleicons.org/ultralytics/0071C5' },
      { name: 'Hugging Face (Model Hub)', level: 85, logo: 'https://cdn.simpleicons.org/huggingface/FFD21E' },
      { name: 'NLP APIs', level: 85, logo: 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/openai.svg' },
      { name: 'Computer Vision (OpenCV)', level: 82, logo: 'https://cdn.simpleicons.org/opencv/5C3EE8' },
      { name: 'Model Quantization & Inference', level: 80, logo: 'https://cdn.simpleicons.org/onnx/00529B' },
    ],
  },
  {
    category: 'DevOps & Cloud Integration',
    jp: '雲',
    icon: 'globe',
    items: [
      { name: 'Docker Containerization', level: 82, logo: 'https://cdn.simpleicons.org/docker/2496ED' },
      { name: 'Google Cloud Platform', level: 78, logo: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
      { name: 'GitHub Version Control', level: 92, logo: 'https://cdn.simpleicons.org/github/000000' },
      { name: 'Vercel Hostings', level: 90, logo: 'https://cdn.simpleicons.org/vercel/000000' },
      { name: 'Render Hostings', level: 80, logo: 'https://cdn.simpleicons.org/render/000000' },
      { name: 'Netlify Cloud', level: 82, logo: 'https://cdn.simpleicons.org/netlify/00AD9F' },
      { name: 'n8n Automation', level: 85, logo: 'https://cdn.simpleicons.org/n8n/FF6C37' },
    ],
  },
];

export const SKILL_COUNT = SKILLS.reduce((n, c) => n + c.items.length, 0);

export const TECH_LOGOS = {
  React: 'https://cdn.simpleicons.org/react/61DAFB',
  Vite: 'https://cdn.simpleicons.org/vite/646CFF',
  'Framer Motion': 'https://cdn.simpleicons.org/framer/0055FF',
  'Custom CSS': 'https://cdn.simpleicons.org/css/1572B6',
  'Vanilla CSS': 'https://cdn.simpleicons.org/css/1572B6',
  'Tailwind CSS': 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  'HTML/CSS': 'https://cdn.simpleicons.org/html5/E34F26',
  'Gemini AI': 'https://cdn.simpleicons.org/googlegemini/8E75B2',
  Python: 'https://cdn.simpleicons.org/python/3776AB',
  'WebSockets/MQTT': 'https://cdn.simpleicons.org/mqtt/3C5280',
  'Chart.js': 'https://cdn.simpleicons.org/chartdotjs/FF6384',
  'NLP APIs': 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/openai.svg',
  YOLOv8: 'https://cdn.simpleicons.org/pytorch/EE4C2C',
  'Google Maps API': 'https://cdn.simpleicons.org/googlemaps/4285F4',
  GPS: 'https://cdn.simpleicons.org/openstreetmap/7EBC6F',
  Flask: 'https://cdn.simpleicons.org/flask/000000',
  Pillow: 'https://cdn.simpleicons.org/python/3776AB',
  PyTorch: 'https://cdn.simpleicons.org/pytorch/EE4C2C',
  GSAP: 'https://cdn.simpleicons.org/greensock/88CE02',
  JavaScript: 'https://cdn.simpleicons.org/javascript/F7DF1E',
  'React Native': 'https://cdn.simpleicons.org/react/61DAFB',
  Expo: 'https://cdn.simpleicons.org/expo/000020',
  TypeScript: 'https://cdn.simpleicons.org/typescript/3178C6',
  Firebase: 'https://cdn.simpleicons.org/firebase/FFCA28',
  Docker: 'https://cdn.simpleicons.org/docker/2496ED',
  FastAPI: 'https://cdn.simpleicons.org/fastapi/009688',
  Rust: 'https://cdn.simpleicons.org/rust/000000',
  SQLite: 'https://cdn.simpleicons.org/sqlite/003B57',
  'VS Code API': 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/visualstudiocode.svg',
  'Node.js': 'https://cdn.simpleicons.org/nodedotjs/5FA04E',
  'AI APIs': 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/openai.svg',
  'Next.js': 'https://cdn.simpleicons.org/nextdotjs/000000',
  Supabase: 'https://cdn.simpleicons.org/supabase/3ECF8E',
};

export const ETHOS = [
  {
    kanji: '開',
    title: 'Open Source Work',
    text: 'Actively contributing to AI research repos, educational web portals, and edge computing automation scripts.',
  },
  {
    kanji: '選',
    title: 'Tech Stack Preference',
    text: 'Daily focus on Python (PyTorch/YOLOv8), React/Next.js ecosystem, and DevOps containerized integrations (Docker/Vercel).',
  },
  {
    kanji: '道',
    title: 'Development Ethos',
    text: 'Combining high-performance machine learning backend models with premium glassmorphic frontend user experiences.',
  },
];

export const NAV = [
  { href: '/home2/', key: 'home2', label: 'Home', jp: '家' },
  { href: '/projects2/', key: 'projects2', label: 'Projects', jp: '作品' },
  { href: '/skills2/', key: 'skills2', label: 'Skills', jp: '技' },
  { href: '/github2/', key: 'github2', label: 'GitHub', jp: '記録' },
  { href: '/blog2/', key: 'blog2', label: 'Blog', jp: '書' },
];
