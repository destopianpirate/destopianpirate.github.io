import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import {
  Github,
  Linkedin,
  Mail,
  Code,
  Database,
  Server,
  Cpu,
  Globe,
  Activity,
  Terminal,
  Layers,
  Sun,
  Moon,
  BarChart2,
  PieChart,
  Play,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  Award,
  Briefcase,
  Home
} from 'lucide-react'
import profilePic from './assets/profile.png'
import LightRays from './components/LightRays/LightRays'
import PillNav from './components/PillNav/PillNav'
import { RadarChart, TechStackConfigurator } from './components/RadarChart/RadarChart';
import AISandbox from './components/AISandbox/AISandbox';
import IoTSimulator from './components/IoTSimulator/IoTSimulator';
import TerminalCLI from './components/TerminalCLI/TerminalCLI';
import GithubExplorer from './components/GithubExplorer/GithubExplorer';
import OscilloscopeDivider from './components/OscilloscopeDivider/OscilloscopeDivider';
import AttentionText from './components/AttentionText/AttentionText';
import BounceCards from './components/BounceCards/BounceCards';
import logoLight from './assets/logo_light.png'
import logoZeroGpt from './assets/logo-zerogpt.png'
import logoAssignmentAI from './assets/assignmentai.svg'
import logoCompressor from './assets/compressor-logo.svg'
import logoQs from './assets/qs_logo.png'
import logoFamShield from './assets/famshield_logo.png'

const projects = [
  {
    title: "QS IITGN",
    stack: ["HTML/CSS", "JavaScript", "GSAP"],
    desc: "The official interactive web platform for the Quizzing Society of IIT Gandhinagar. Designed to host daily trivia challenges, manage society events, and catalog campus quiz archives.",
    features: [
      "Interactive Daily Challenge trivia engine with animated countdowns",
      "On This Day historical timeline dynamically generated from local JSON databases",
      "Cinematic GSAP entrance choreographies and scroll-triggered transitions",
      "Context-aware interactive mascot (Quizby) providing dynamic trivia feedback",
      "Progressive Web App (PWA) configurations with offline assets caching"
    ],
    liveUrl: "https://destopianpirate.github.io/qs_iitgn/",
    logo: <img src={logoQs} alt="QS IITGN Logo" />,
    hasImageLogo: true
  },
  {
    title: "AcadX (student_portal)",
    stack: ["React", "Vite", "Framer Motion", "Custom CSS"],
    desc: "A sleek, glassmorphic academic planner and student workspace to manage university life. It coordinates coursework, monitors attendance, and calculates real-time academic standing.",
    features: [
      "Synced timetables and calendar scheduling",
      "University holidays registry integration",
      "Automatic course conflict detection systems",
      "Dynamic GPA & attendance trackers",
      "Integrated Gemini AI study companion for personalized learning support"
    ],
    liveUrl: "https://stuiit.vercel.app",
    logo: <img src={logoLight} alt="AcadX Logo" />,
    hasImageLogo: true
  },
  {
    title: "AssignmentAI",
    stack: ["React", "Gemini AI", "Python", "Vite"],
    desc: "A high-performance, vision-capable educational helper that reads, analyzes, and explains math and computer science assignments directly from files.",
    features: [
      "Vision-capable OCR solving for handwritten and digital equations",
      "Fast client-side PDF document export & formatting",
      "Detailed step-by-step mathematical reasoning explanations",
      "Interactive AI tutor chat interface for real-time concept questions"
    ],
    liveUrl: "https://asignmentai.vercel.app",
    logo: <img src={logoAssignmentAI} alt="AssignmentAI Logo" />,
    hasImageLogo: true
  },
  {
    title: "RoadGuard AI",
    stack: ["YOLOv8", "Python", "Google Maps API", "GPS"],
    desc: "An Edge AI traffic safety application deploying real-time computer vision models to detect and report road infrastructure defects.",
    features: [
      "YOLOv8 object detection model integration for anomalies",
      "Precise GPS coordinate mapping for road defects",
      "Automated system to sync coordinates with Google Maps API",
      "Real-time processing dashboard for infrastructure logs"
    ],
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>
    )
  },
  {
    title: "FamShield",
    stack: ["React Native", "Expo", "Firebase", "TypeScript"],
    desc: "A cross-platform mobile application designed for real-time family safety, device telemetry tracking, and remote parent administration. Built with a Firebase backend, it coordinates real-time location mapping and remote command executions.",
    features: [
      "Real-time location tracking and geo-fencing overlays powered by React Native Maps",
      "Comprehensive device telemetry reporting including battery level, volume, and connection states",
      "Low-latency remote command listener execution system utilizing Firebase Firestore",
      "Custom native power management modules and overlay integration via Expo modules",
      "Secure client-side pairing system separating parent dashboards from child terminals"
    ],
    logo: <img src={logoFamShield} alt="FamShield Logo" />,
    hasImageLogo: true
  },
  {
    title: "ZeroGPTi",
    stack: ["React", "Vite", "NLP APIs", "Vanilla CSS"],
    desc: "An advanced content analysis system built to inspect, identify, and report machine-generated or paraphrased text.",
    features: [
      "Proprietary grading scales for AI-generated sentence structures",
      "Deep natural language pattern analysis logs",
      "Interactive highlighter showing AI vs human written paragraphs"
    ],
    liveUrl: "https://zerogpti.vercel.app",
    logo: <img src={logoZeroGpt} alt="ZeroGPTi Logo" />,
    hasImageLogo: true
  },
  {
    title: "IoT Dashboard",
    stack: ["React", "Vite", "Tailwind CSS", "WebSockets/MQTT", "Chart.js"],
    desc: "A professional real-time telemetry dashboard designed for large-scale sensor network configuration and graphical event log visualization.",
    features: [
      "Real-time sensor telemetry streaming over WebSockets & MQTT",
      "Highly interactive widgets (dials, live line graphs, grid status controls)",
      "Automated system alerts and threshold breach logs",
      "Comprehensive device connection logs & diagnostic telemetry"
    ],
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="21" x2="9" y2="9" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <path d="M14 13h3m-3 3h4" />
      </svg>
    )
  },
  {
    title: "ImagePress - Image Compressor",
    stack: ["Python", "Flask", "Pillow", "HTML/CSS"],
    desc: "A lightning-fast web service that handles media optimization, file size compression, and instant conversion between next-gen image formats.",
    features: [
      "High-ratio image optimization preserving high resolution",
      "Supports WebP, PNG, JPG, and AVIF image compression pipelines",
      "Batch upload capabilities and quick download links"
    ],
    liveUrl: "https://imagepresss.vercel.app",
    logo: <img src={logoCompressor} alt="ImagePress Logo" />,
    hasImageLogo: true
  }
];

const skillsData = [
  {
    category: "Programming Languages",
    icon: <Terminal />,
    items: [
      { name: "Python (AI/ML & Flask)", level: "95%", logoUrl: "https://cdn.simpleicons.org/python/3776AB" },
      { name: "JavaScript / ES6+", level: "90%", logoUrl: "https://cdn.simpleicons.org/javascript/F7DF1E" },
      { name: "TypeScript", level: "85%", logoUrl: "https://cdn.simpleicons.org/typescript/3178C6" },
      { name: "C++ (Edge AI Systems)", level: "80%", logoUrl: "https://cdn.simpleicons.org/cplusplus/00599C" }
    ]
  },
  {
    category: "Frontend Development",
    icon: <Code />,
    items: [
      { name: "React (Hooks & Context)", level: "92%", logoUrl: "https://cdn.simpleicons.org/react/61DAFB" },
      { name: "CSS (Vanilla & Flex/Grid)", level: "95%", logoUrl: "https://cdn.simpleicons.org/css3/1572B6" },
      { name: "HTML5 / CSS3 (Aesthetics)", level: "95%", logoUrl: "https://cdn.simpleicons.org/html5/E34F26" },
      { name: "Framer Motion", level: "88%", logoUrl: "https://cdn.simpleicons.org/framer/0055FF" }
    ]
  },
  {
    category: "Backend & Systems",
    icon: <Server />,
    items: [
      { name: "Node.js (Express)", level: "88%", logoUrl: "https://cdn.simpleicons.org/nodedotjs/339933" },
      { name: "Django (Robust APIs)", level: "82%", logoUrl: "https://cdn.simpleicons.org/django/092E20" },
      { name: "Flask (Microservices)", level: "85%", logoUrl: "https://cdn.simpleicons.org/flask/000000" },
      { name: "High-Performance Systems", level: "80%", logoUrl: null }
    ]
  },
  {
    category: "Databases & Storage",
    icon: <Database />,
    items: [
      { name: "Supabase (PostgreSQL & Auth)", level: "86%", logoUrl: "https://cdn.simpleicons.org/supabase/3ECF8E" },
      { name: "Firebase (Realtime DB & Auth)", level: "85%", logoUrl: "https://cdn.simpleicons.org/firebase/FFCA28" }
    ]
  },
  {
    category: "Edge AI & Computer Vision",
    icon: <Cpu />,
    items: [
      { name: "PyTorch Deep Learning", level: "90%", logoUrl: "https://cdn.simpleicons.org/pytorch/EE4C2C" },
      { name: "TensorFlow Engine", level: "82%", logoUrl: "https://cdn.simpleicons.org/tensorflow/FF6F00" },
      { name: "Scikit-Learn ML", level: "88%", logoUrl: "https://cdn.simpleicons.org/scikitlearn/F7931E" },
      { name: "YOLOv8 Edge Implementations", level: "88%", logoUrl: "https://cdn.simpleicons.org/ultralytics/0071C5" },
      { name: "Hugging Face (Model Hub)", level: "85%", logoUrl: "https://cdn.simpleicons.org/huggingface/FFD21E" },
      { name: "NLP APIs", level: "85%", logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg?color=000000" },
      { name: "Computer Vision (OpenCV)", level: "82%", logoUrl: "https://cdn.simpleicons.org/opencv/5C3EE8" },
      { name: "Model Quantization & Inference", level: "80%", logoUrl: "https://cdn.simpleicons.org/onnx/00529B" }
    ]
  },
  {
    category: "DevOps & Cloud Integration",
    icon: <Globe />,
    items: [
      { name: "Docker Containerization", level: "82%", logoUrl: "https://cdn.simpleicons.org/docker/2496ED" },
      { name: "Google Cloud Platform", level: "78%", logoUrl: "https://cdn.simpleicons.org/googlecloud/4285F4" },
      { name: "GitHub Version Control", level: "92%", logoUrl: "https://cdn.simpleicons.org/github/000000" },
      { name: "Vercel Hostings", level: "90%", logoUrl: "https://cdn.simpleicons.org/vercel/000000" },
      { name: "Render Hostings", level: "80%", logoUrl: "https://cdn.simpleicons.org/render/000000" },
      { name: "Netlify Cloud", level: "82%", logoUrl: "https://cdn.simpleicons.org/netlify/00AD9F" },
      { name: "n8n Automation", level: "85%", logoUrl: "https://cdn.simpleicons.org/n8n/FF6C37" }
    ]
  }
];

const bioPillars = [
  {
    title: "Artificial Intelligence",
    desc: "Designing neural networks, vision OCR systems, and generative study intelligence.",
    icon: <Cpu size={24} />,
    tag: "AI / ML"
  },
  {
    title: "Systems Engineering",
    desc: "Deploying high-performance containerized software pipelines and automated DevOps workflows.",
    icon: <Globe size={24} />,
    tag: "Systems"
  },
  {
    title: "Full-Stack Web",
    desc: "Engineering premium, glassmorphic interfaces and scalable backend services.",
    icon: <Layers size={24} />,
    tag: "Web App"
  }
];

const timelineData = [
  {
    date: "July 2025 - Present",
    title: "B.Tech in Artificial Intelligence",
    institution: "IIT Gandhinagar",
    desc: "Pursuing specialized studies in deep learning pipelines, edge computing optimizations, computer vision, and scalable intelligent web applications.",
    icon: <Cpu size={14} />
  },
  {
    date: "June 2023 - March 2024",
    title: "Class XII (CBSE Board)",
    institution: "Gurukul Academy, Lucknow",
    desc: "Completed secondary education scoring 95.2% aggregate. Focused on Advanced Mathematics, Physics, and Chemistry.",
    icon: <GraduationCap size={14} />,
    giantPercentage: "95.2%"
  },
  {
    date: "June 2021 - March 2022",
    title: "Class X (CBSE Board)",
    institution: "Gurukul Academy, Lucknow",
    desc: "Completed high school studies scoring 97.4% aggregate.",
    icon: <Award size={14} />,
    giantPercentage: "97.4%"
  }
];

const techLogos = {
  "React": "https://cdn.simpleicons.org/react/61DAFB",
  "Vite": "https://cdn.simpleicons.org/vite/646CFF",
  "Framer Motion": "https://cdn.simpleicons.org/framer/0055FF",
  "Custom CSS": "https://cdn.simpleicons.org/css3/1572B6",
  "Vanilla CSS": "https://cdn.simpleicons.org/css3/1572B6",
  "Tailwind CSS": "https://cdn.simpleicons.org/tailwindcss/06B6D4",
  "HTML/CSS": "https://cdn.simpleicons.org/html5/E34F26",
  "Gemini AI": "https://cdn.simpleicons.org/google/4285F4",
  "Python": "https://cdn.simpleicons.org/python/3776AB",
  "WebSockets/MQTT": "https://cdn.simpleicons.org/mqtt/3C5280",
  "Chart.js": "https://cdn.simpleicons.org/chartdotjs/FF6384",
  "NLP APIs": "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg?color=000000",
  "YOLOv8": "https://cdn.simpleicons.org/pytorch/EE4C2C",
  "Google Maps API": "https://cdn.simpleicons.org/googlemaps/4285F4",
  "GPS": "https://cdn.google.com/search?q=gps",
  "Flask": "https://cdn.simpleicons.org/flask/000000",
  "Pillow": "https://cdn.simpleicons.org/python/3776AB",
  "Jupyter Notebooks": "https://cdn.simpleicons.org/jupyter/F37626",
  "PyTorch": "https://cdn.simpleicons.org/pytorch/EE4C2C",
  "GSAP": "https://cdn.simpleicons.org/greensock/88CE02",
  "React Native": "https://cdn.simpleicons.org/react/61DAFB",
  "Expo": "https://cdn.simpleicons.org/expo/000020",
  "TypeScript": "https://cdn.simpleicons.org/typescript/3178C6",
  "Firebase": "https://cdn.simpleicons.org/firebase/FFCA28",
};

function isDarkLogo(url) {
  if (!url) return false;
  if (url.includes('000000') || url.includes('181717')) return true;
  
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  const hexPart = lastPart.split('?')[0];
  
  if (hexPart && hexPart.length === 6) {
    const r = parseInt(hexPart.substring(0, 2), 16);
    const g = parseInt(hexPart.substring(2, 4), 16);
    const b = parseInt(hexPart.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance < 80;
    }
  }
  return false;
}

const projectRadarFocus = {
  "AcadX (student_portal)": { "AI / ML": 40, "Frontend": 95, "Backend": 70, "Databases": 80, "DevOps": 60, "Systems": 50 },
  "AssignmentAI": { "AI / ML": 95, "Frontend": 85, "Backend": 80, "Databases": 40, "DevOps": 60, "Systems": 70 },
  "IoT Dashboard": { "AI / ML": 30, "Frontend": 80, "Backend": 90, "Databases": 70, "DevOps": 60, "Systems": 85 },
  "ZeroGPTi": { "AI / ML": 90, "Frontend": 70, "Backend": 60, "Databases": 30, "DevOps": 40, "Systems": 65 },
  "RoadGuard AI": { "AI / ML": 95, "Frontend": 40, "Backend": 75, "Databases": 50, "DevOps": 60, "Systems": 90 },
  "ImagePress - Image Compressor": { "AI / ML": 20, "Frontend": 70, "Backend": 90, "Databases": 40, "DevOps": 70, "Systems": 80 },
  "QS IITGN": { "AI / ML": 10, "Frontend": 95, "Backend": 40, "Databases": 30, "DevOps": 50, "Systems": 40 },
  "FamShield": { "AI / ML": 20, "Frontend": 80, "Backend": 85, "Databases": 75, "DevOps": 60, "Systems": 90 }
};

const radarAxes = [
  { name: "AI / ML", key: "AI / ML" },
  { name: "Frontend", key: "Frontend" },
  { name: "Backend", key: "Backend" },
  { name: "Databases", key: "Databases" },
  { name: "DevOps", key: "DevOps" },
  { name: "Systems", key: "Systems" }
];

const coreSkillsFocus = {
  "AI / ML": 90,
  "Frontend": 92,
  "Backend": 85,
  "Databases": 86,
  "DevOps": 85,
  "Systems": 88
};

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'stats', label: 'GitHub' }
];

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768 ? 'dark' : 'light';
    }
    return 'light';
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [sandboxTab, setSandboxTab] = useState('ai');
  const [terminalOpen, setTerminalOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollY } = useScroll();

  // Create a spring-smoothed scroll position to prevent scroll jitter and lag smoothly
  const scrollYSpring = useSpring(scrollY, {
    stiffness: 35,
    damping: 24,
    mass: 0.5,
    restDelta: 0.001
  });

  const yGlow1 = useTransform(scrollYSpring, [0, 1000], [0, 150]);
  const yGlow2 = useTransform(scrollYSpring, [0, 1000], [0, -150]);
  const yHeroText = useTransform(scrollYSpring, [0, 600], [0, isMobile ? 0 : -45]);
  const yProfile = useTransform(scrollYSpring, [0, 600], [0, isMobile ? 0 : 55]);

  // Pillar card parallax translations (staggered rates)
  const yPillar1 = useTransform(scrollYSpring, [100, 1000], [0, isMobile ? 0 : -25]);
  const yPillar2 = useTransform(scrollYSpring, [100, 1000], [0, isMobile ? 0 : -10]);
  const yPillar3 = useTransform(scrollYSpring, [100, 1000], [0, isMobile ? 0 : -45]);

  // Timeline parallax translations
  const yTimelineHeader = useTransform(scrollYSpring, [50, 700], [0, isMobile ? 0 : -35]);
  const yTimeline = useTransform(scrollYSpring, [50, 850], [0, isMobile ? 0 : 15]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '`') {
        setTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <div className="app-layout">
      <motion.div className="bg-glow-1" style={{ y: yGlow1 }}></motion.div>
      <motion.div className="bg-glow-2" style={{ y: yGlow2 }}></motion.div>

      <div style={{ width: '100%', height: '600px', position: 'absolute', top: isMobile ? '110px' : '75px', left: 0, zIndex: 0, pointerEvents: 'none', opacity: theme === 'dark' ? 0.7 : 0.2, maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor={theme === 'dark' ? "#ffffff" : "#000000"}
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      <div className="header-wrapper">
        <header className="header container">
          <div className="header-brand" onClick={() => setActiveTab('about')} style={{ cursor: 'pointer' }}>
            <img src={profilePic} alt="Ayush Singh" className="header-avatar" />
            <div className="header-title">
              Ayush Singh <span>at IITGN</span>
            </div>
          </div>
          <div className="header-right">
            <PillNav
              items={NAV_ITEMS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
          </div>
        </header>
      </div>

      <div className="header-grid-pattern">
        <div className="grid-glow-square square-1"></div>
        <div className="grid-glow-square square-2"></div>
        <div className="grid-glow-square square-3"></div>
      </div>

      <main className="container">
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="about-tab-container"
            >
              <div className="about-grid">
                <motion.div className="about-content" style={{ y: yHeroText }}>
                  <h1 style={{ fontWeight: 800 }}>Hi there, I'm <br /><span>Ayush Singh!</span></h1>
                  <div className="profile-card-container mobile-only-profile">
                    <div className="profile-image-frame">
                      <img src={profilePic} alt="Ayush Singh Profile" className="profile-large-image" />
                    </div>
                  </div>

                  <div className="about-subtitle">
                    Pursuing B.Tech in Artificial Intelligence at IIT Gandhinagar (Entered 2025)
                  </div>

                  <AttentionText>
                    <p className="about-bio">
                      I design and engineer intelligent applications at the intersection of Artificial Intelligence and Full-Stack Web Development. I focus on translating complex neural networks into beautiful, responsive, and production-ready interfaces, bridging the gap between machine learning models and user-friendly software architectures.
                    </p>
                    <p className="about-bio-highlight">
                      Let's build something intelligent. Exploring ways to merge deep learning software with scalable systems and modern frontend aesthetics.
                    </p>
                  </AttentionText>
                  <div className="about-socials">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayushspna4040@gmail.com" target="_blank" rel="noreferrer" className="footer-social-link">
                      <Mail size={16} /> Email Me
                    </a>
                    <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" className="footer-social-link">
                      <Github size={16} /> GitHub
                    </a>
                    <a href="https://linkedin.com/in/ayushxphoenix" target="_blank" rel="noreferrer" className="footer-social-link">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  </div>
                </motion.div>

                <motion.div className="profile-card-container desktop-only-profile" style={{ y: yProfile }}>
                  <div className="profile-image-frame">
                    <img src={profilePic} alt="Ayush Singh Profile" className="profile-large-image" />
                  </div>
                </motion.div>
              </div>

              <div className="about-timeline-section" style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
                <h2 className="timeline-section-title">Academic Journey</h2>
                <div className="timeline-container">
                  {timelineData.map((item, idx) => (
                    <motion.div 
                      className="timeline-item" 
                      key={idx}
                      initial={{ opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                      <div className="timeline-marker">
                        <div className="timeline-dot-wrapper">
                          <span className="timeline-icon-inner">{item.icon}</span>
                        </div>
                        {idx !== timelineData.length - 1 && <div className="timeline-line"></div>}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header-row">
                          <div className="timeline-date">{item.date}</div>
                          {item.badge && (
                            <span className="timeline-badge" style={{ borderColor: item.badgeColor, color: item.badgeColor }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="timeline-title">{item.title}</h3>
                        <div className="timeline-institution">{item.institution}</div>
                        <p className="timeline-description">{item.desc}</p>
                        {item.giantPercentage && (
                          <div className="timeline-giant-percentage">{item.giantPercentage}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="about-pillars-grid">
                {bioPillars.map((pillar, idx) => {
                  const yPillar = idx === 0 ? yPillar1 : idx === 1 ? yPillar2 : yPillar3;
                  return (
                    <motion.div className="pillar-card" key={idx} style={{ y: yPillar }}>
                      <div className="pillar-card-header">
                        <span className="pillar-icon-wrapper">{pillar.icon}</span>
                        <span className="pillar-tag">{pillar.tag}</span>
                      </div>
                      <h3 className="pillar-title">{pillar.title}</h3>
                      <p className="pillar-desc">{pillar.desc}</p>
                    </motion.div>
                  );
                })}
              </div>

              <BounceCards
                projects={projects}
                onViewAll={() => {
                  setActiveTab('projects');
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                animationDelay={0.3}
                animationStagger={0.06}
                easeType="back.out(1.4)"
                enableHover={true}
                desktopTransforms={[
                  'rotate(4deg) translate(-180px)',
                  'rotate(1deg) translate(-85px)',
                  'rotate(-2deg)',
                  'rotate(2deg) translate(85px)',
                  'rotate(-4deg) translate(180px)'
                ]}
                mobileTransforms={[
                  'rotate(5deg) translate(-95px)',
                  'rotate(-2deg)',
                  'rotate(-5deg) translate(95px)'
                ]}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="tab-section"
            >
              <h2 className="section-title">Featured Repositories</h2>
              <p className="section-subtitle">
                A selection of web platforms, deep learning applications, and edge telemetry projects built using cutting-edge frameworks.
              </p>

              <div className="projects-grid">
                {projects.map((project, i) => (
                  <div className="project-card" key={i}>
                    <div className={`project-bg-icon ${project.hasImageLogo ? 'image-watermark' : ''} ${project.title.includes('AcadX') ? 'acadx-bg-icon' : ''} ${project.title.includes('AssignmentAI') ? 'assignmentai-bg-icon' : ''} ${project.title.includes('ImagePress') || project.title.includes('Compressor') ? 'compressor-bg-icon' : ''} ${project.title.includes('QS IITGN') ? 'qs-bg-icon' : ''} ${project.title.includes('FamShield') ? 'famshield-bg-icon' : ''}`}>
                      {project.logo}
                    </div>
                    <div className="project-header">
                      <div className={`project-logo-container ${project.hasImageLogo ? 'white-bg' : ''}`}>
                        {project.logo}
                      </div>
                      <div className="project-badges-wrapper">
                        {(project.title.includes('AcadX') || project.title.includes('Image Compressor') || project.title.includes('ImagePress') || project.title.includes('QS') || project.title.includes('FamShield')) && (
                          <span className="featured-badge">Featured</span>
                        )}
                        <div className="project-links">
                          <a
                            href="https://github.com/destopianpirate"
                            target="_blank"
                            rel="noreferrer"
                            className="project-link-btn"
                            title="View Repository"
                          >
                            <Github size={16} />
                          </a>
                        </div>
                      </div>
                    </div>

                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.desc}</p>

                    <div className="project-stack">
                      {project.stack.map((tech) => (
                        <span className="tech-pill" key={tech} title={tech}>
                          {techLogos[tech] ? (
                            <img
                              src={techLogos[tech]}
                              alt={tech}
                              style={{ width: 18, height: 18, filter: theme === 'dark' && isDarkLogo(techLogos[tech]) ? 'invert(1)' : 'none' }}
                            />
                          ) : (
                            tech
                          )}
                        </span>
                      ))}
                    </div>

                    {project.features.length > 0 && (
                      <div>
                        <div className="project-bullet-title">Key Core Features</div>
                        <ul className="project-bullets">
                          {project.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.liveUrl && (
                      <div className="project-visit-btn-wrapper" style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="project-visit-btn"
                        >
                          Visit Site
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="tab-section"
            >
              <h2 className="section-title">Languages & Core Stack</h2>
              <p className="section-subtitle">
                My proficiency in frontend design, server architectures, deep learning models, databases, and embedded system programming.
              </p>

              <div className="skills-radar-container" style={{ marginBottom: '3.5rem' }}>
                <RadarChart activeProject={selectedProject} />
                <TechStackConfigurator activeProject={selectedProject} setActiveProject={setSelectedProject} projects={projects} />
              </div>



              <div className="skills-tab-layout" style={{ marginTop: '3.5rem' }}>
                <div className="skills-column">
                  {skillsData.slice(0, 4).map((category, i) => (
                    <div className={`skills-card ${category.category.includes('Databases') ? 'databases-storage-card' : ''}`} key={category.category}>
                      <h3 className="skills-category-title">
                        <span className="skill-icon-placeholder">{category.icon}</span>
                        {category.category}
                      </h3>
                      <div className="skills-list-wrapper">
                        {category.items.map((item, idx) => (
                          <div className="skill-row" key={idx}>
                            <div className="skill-info">
                              {item.logoUrl ? (
                                <img src={item.logoUrl} alt={item.name} style={{ width: 24, height: 24, filter: theme === 'dark' && isDarkLogo(item.logoUrl) ? 'invert(1)' : 'none' }} />
                              ) : (
                                <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}></div>
                              )}
                              <span className="skill-name">{item.name}</span>
                            </div>
                            <div className="skill-bar-bg" title={`${item.name} proficiency level: ${item.level}`}>
                              <div className="skill-bar-fill" style={{ width: item.level }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="skills-column">
                  {skillsData.slice(4, 6).map((category, i) => (
                    <div className="skills-card" key={category.category}>
                      <h3 className="skills-category-title">
                        <span className="skill-icon-placeholder">{category.icon}</span>
                        {category.category}
                      </h3>
                      <div className="skills-list-wrapper">
                        {category.items.map((item, idx) => (
                          <div className="skill-row" key={idx}>
                            <div className="skill-info">
                              {item.logoUrl ? (
                                <img src={item.logoUrl} alt={item.name} style={{ width: 24, height: 24, filter: theme === 'dark' && isDarkLogo(item.logoUrl) ? 'invert(1)' : 'none' }} />
                              ) : (
                                <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}></div>
                              )}
                              <span className="skill-name">{item.name}</span>
                            </div>
                            <div className="skill-bar-bg" title={`${item.name} proficiency level: ${item.level}`}>
                              <div className="skill-bar-fill" style={{ width: item.level }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="tab-section"
            >
              <h2 className="section-title">Interactive Engineering Sandbox</h2>
              <p className="section-subtitle">
                Experiment with live edge models, LLM parameters, and MQTT telemetry systems in real-time.
              </p>

              <div className="sandbox-subtabs">
                <button
                  className={`sandbox-subtab-btn ${sandboxTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setSandboxTab('ai')}
                >
                  <Cpu size={16} /> AI Prompt Sandbox
                </button>
                <button
                  className={`sandbox-subtab-btn ${sandboxTab === 'iot' ? 'active' : ''}`}
                  onClick={() => setSandboxTab('iot')}
                >
                  <Activity size={16} /> IoT Telemetry Dashboard
                </button>
              </div>

              {sandboxTab === 'ai' ? <AISandbox /> : <IoTSimulator />}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabContentVariants}
              className="tab-section"
            >
              <h2 className="section-title">GitHub Insights</h2>
              <p className="section-subtitle">
                Real-time contribution statistics, system streaks, and activity metrics tracking my work.
              </p>

              <div className="stats-dashboard">
                <div className="stats-subgrid">
                  <div className="stat-widget">
                    <div className="widget-title">
                      <BarChart2 size={18} /> Repository Statistics
                    </div>
                    <div className="stat-image-container">
                      <img
                        src={`https://github-readme-stats.vercel.app/api?username=destopianpirate&show_icons=true&theme=transparent&title_color=${theme === 'dark' ? 'ffffff' : '111111'}&icon_color=${theme === 'dark' ? 'ffffff' : '111111'}&text_color=${theme === 'dark' ? 'cccccc' : '333333'}&v=2`}
                        alt="GitHub Profile Statistics"
                      />
                    </div>
                  </div>

                  <div className="stat-widget">
                    <div className="widget-title">
                      <PieChart size={18} /> Language Distribution
                    </div>
                    <div className="stat-image-container">
                      <img
                        src={`https://github-readme-stats.vercel.app/api/top-langs/?username=destopianpirate&layout=compact&theme=transparent&title_color=${theme === 'dark' ? 'ffffff' : '111111'}&text_color=${theme === 'dark' ? 'cccccc' : '333333'}&v=2`}
                        alt="Top Languages"
                      />
                    </div>
                  </div>
                </div>

                <div className="stats-subgrid">
                  <div className="stat-widget">
                    <div className="widget-title">
                      <Activity size={18} /> Contribution Streaks
                    </div>
                    <div className="stat-image-container">
                      <img
                        src={`https://github-readme-streak-stats.herokuapp.com/?user=destopianpirate&theme=${theme === 'dark' ? 'transparent' : 'light'}&hide_border=true&title_color=${theme === 'dark' ? 'ffffff' : '111111'}&text_color=${theme === 'dark' ? 'cccccc' : '333333'}&sideNums=${theme === 'dark' ? 'ffffff' : '111111'}&sideLabels=${theme === 'dark' ? 'aaaaaa' : '555555'}&ring=${theme === 'dark' ? 'ffffff' : '111111'}&fire=${theme === 'dark' ? 'ffffff' : '111111'}&currStreakNum=${theme === 'dark' ? 'ffffff' : '111111'}&v=2`}
                        alt="GitHub Streaks Metrics"
                      />
                    </div>
                  </div>

                  <div className="stat-widget">
                    <div className="widget-title">
                      <Code size={18} /> Activity Graph
                    </div>
                    <div className="stat-image-container">
                      <img
                        src={`https://github-readme-activity-graph.vercel.app/graph?username=destopianpirate&theme=${theme === 'dark' ? 'transparent' : 'light'}&color=${theme === 'dark' ? 'ffffff' : '111111'}&line=${theme === 'dark' ? 'ffffff' : '111111'}&point=${theme === 'dark' ? 'ffffff' : '111111'}&hide_border=true&v=2`}
                        alt="Commit Activity Graph"
                      />
                    </div>
                  </div>
                </div>

                <div className="stats-highlights-grid">
                  <div className="highlight-card">
                    <h4>Open Source Work</h4>
                    <p>Actively contributing to AI research repos, educational web portals, and edge computing automation scripts.</p>
                  </div>
                  <div className="highlight-card">
                    <h4>Tech Stack Preference</h4>
                    <p>Daily focus on Python (PyTorch/YOLOv8), React/Next.js ecosystem, and DevOps containerized integrations (Docker/Vercel).</p>
                  </div>
                  <div className="highlight-card">
                    <h4>Development Ethos</h4>
                    <p>Combining high-performance machine learning backend models with premium glassmorphic frontend user experiences.</p>
                  </div>
                </div>

                <GithubExplorer />

                <div className="github-profile-banner">
                  <div className="banner-content">
                    <h3>Looking for more details?</h3>
                    <p>Explore my repositories, follow my open-source journey, and check out my full project archives directly on GitHub.</p>
                  </div>
                  <a
                    href="https://github.com/destopianpirate"
                    target="_blank"
                    rel="noreferrer"
                    className="banner-btn"
                  >
                    <Github size={18} /> View GitHub Profile
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <OscilloscopeDivider theme={theme} isMobile={isMobile} skillsData={skillsData} />

      <footer>
        <div className="container">
          <section className="footer-contact-section">
            <div className="contact-card-wrapper">
              <div className="contact-glow-bg"></div>
              <h2 className="contact-title">Let's Connect</h2>
              <p className="contact-desc">
                Whether you want to discuss a research opportunity, collaborate on an AI/Web project, or just say hello, my inbox is always open.
              </p>
              <div className="contact-links-grid">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayushspna4040@gmail.com" target="_blank" rel="noreferrer" className="contact-link-card mail-card">
                  <div className="contact-icon-box mail-glow"><Mail size={22} /></div>
                  <div className="contact-info-text">
                    <span className="contact-label">Email Me</span>
                    <span className="contact-val">ayushspna4040@gmail.com</span>
                  </div>
                </a>
                <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" className="contact-link-card github-card">
                  <div className="contact-icon-box github-glow"><Github size={22} /></div>
                  <div className="contact-info-text">
                    <span className="contact-label">GitHub</span>
                    <span className="contact-val">github.com/destopianpirate</span>
                  </div>
                </a>
                <a href="https://linkedin.com/in/ayushxphoenix" target="_blank" rel="noreferrer" className="contact-link-card linkedin-card">
                  <div className="contact-icon-box linkedin-glow"><Linkedin size={22} /></div>
                  <div className="contact-info-text">
                    <span className="contact-label">LinkedIn</span>
                    <span className="contact-val">linkedin.com/in/ayushxphoenix</span>
                  </div>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=IIT+Gandhinagar+Gujarat" target="_blank" rel="noreferrer" className="contact-link-card work-card">
                  <div className="contact-icon-box work-glow"><Briefcase size={22} /></div>
                  <div className="contact-info-text">
                    <span className="contact-label">Work / University</span>
                    <span className="contact-val">IIT Gandhinagar, Gujarat</span>
                  </div>
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=Prayagraj+Uttar+Pradesh" target="_blank" rel="noreferrer" className="contact-link-card home-card">
                  <div className="contact-icon-box home-glow"><Home size={22} /></div>
                  <div className="contact-info-text">
                    <span className="contact-label">Home Town</span>
                    <span className="contact-val">Prayagraj, UP</span>
                  </div>
                </a>
              </div>
            </div>
          </section>

          <p className="footer-credits">
            &copy; {new Date().getFullYear()} Ayush Singh.
          </p>
        </div>
      </footer>

      <button
        className="cli-floating-btn"
        onClick={() => setTerminalOpen(prev => !prev)}
        title="Toggle CLI Console (HotKey: `)"
      >
        <Terminal size={22} />
      </button>

      <TerminalCLI
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </div>
  )
}

export default App
