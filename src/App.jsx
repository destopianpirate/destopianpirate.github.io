import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Github, 
  Linkedin, 
  Mail, 
  Code, 
  Database, 
  Server, 
  Cpu, 
  Globe, 
  ExternalLink, 
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
  Award
} from 'lucide-react'
import profilePic from './assets/profile.png'

const projects = [
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
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    )
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
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    )
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
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <path d="M14 13h3m-3 3h4"/>
      </svg>
    )
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
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
        <polyline points="12 2 12 6"/>
        <polyline points="12 18 12 22"/>
        <polyline points="2 12 6 12"/>
        <polyline points="18 12 22 12"/>
      </svg>
    )
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
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="2" x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="4" y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
      </svg>
    )
  },
  {
    title: "Image Compressor",
    stack: ["Python", "Flask", "Pillow", "HTML/CSS"],
    desc: "A lightning-fast web service that handles media optimization, file size compression, and instant conversion between next-gen image formats.",
    features: [
      "High-ratio image optimization preserving high resolution", 
      "Supports WebP, PNG, JPG, and AVIF image compression pipelines", 
      "Batch upload capabilities and quick download links"
    ],
    liveUrl: "https://imagepress.vercell.app",
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h8l6 6v14c0 .5-.2 1-.6 1.4-.4.4-.9.6-1.4.6H6c-.5 0-1-.2-1.4-.6C4.2 23 4 22.5 4 22z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="m9 15 3 3 3-3"/>
        <line x1="12" y1="11" x2="12" y2="18"/>
      </svg>
    )
  },
  {
    title: "IITGN.AI",
    stack: ["Python", "Jupyter Notebooks", "PyTorch"],
    desc: "My academic research repository housing code, model training checkpoints, and deep learning notebooks written during courses at IIT Gandhinagar.",
    features: [
      "Machine learning models & dataset pipelines", 
      "Neural network research scripts developed under NewEra.ai", 
      "University coursework notebooks covering advanced algorithms"
    ],
    logo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 17V7l7 10V7"/>
      </svg>
    )
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
      { name: "Next.js (App Router)", level: "85%", logoUrl: "https://cdn.simpleicons.org/nextdotjs/000000" },
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
      { name: "MongoDB (NoSQL Document)", level: "86%", logoUrl: "https://cdn.simpleicons.org/mongodb/47A248" },
      { name: "Firebase (Realtime DB & Auth)", level: "85%", logoUrl: "https://cdn.simpleicons.org/firebase/FFCA28" },
      { name: "SQLite (Relational Core)", level: "90%", logoUrl: "https://cdn.simpleicons.org/sqlite/003B57" },
      { name: "PostgreSQL (Enterprise)", level: "80%", logoUrl: "https://cdn.simpleicons.org/postgresql/4169E1" }
    ]
  },
  {
    category: "DevOps & Cloud Integration",
    icon: <Globe />,
    items: [
      { name: "Docker Containerization", level: "82%", logoUrl: "https://cdn.simpleicons.org/docker/2496ED" },
      { name: "Google Cloud Platform", level: "78%", logoUrl: "https://cdn.simpleicons.org/googlecloud/4285F4" },
      { name: "GitHub Version Control", level: "92%", logoUrl: "https://cdn.simpleicons.org/github/000000" },
      { name: "Vercel Hostings", level: "90%", logoUrl: "https://cdn.simpleicons.org/vercel/000000" }
    ]
  },
  {
    category: "Edge AI & Computer Vision",
    icon: <Cpu />,
    items: [
      { name: "YOLOv8 Edge Implementations", level: "88%", logoUrl: null },
      { name: "Hugging Face (Model Hub)", level: "85%", logoUrl: "https://cdn.simpleicons.org/huggingface/FFD21E" },
      { name: "Computer Vision (OpenCV)", level: "82%", logoUrl: null },
      { name: "Model Quantization & Inference", level: "80%", logoUrl: null }
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
  "NLP APIs": "https://cdn.simpleicons.org/openai/412991",
  "YOLOv8": "https://cdn.simpleicons.org/pytorch/EE4C2C",
  "Google Maps API": "https://cdn.simpleicons.org/googlemaps/4285F4",
  "GPS": "https://cdn.simpleicons.org/googleearth/1A73E8",
  "Flask": "https://cdn.simpleicons.org/flask/000000",
  "Pillow": "https://cdn.simpleicons.org/python/3776AB",
  "Jupyter Notebooks": "https://cdn.simpleicons.org/jupyter/F37626",
  "PyTorch": "https://cdn.simpleicons.org/pytorch/EE4C2C",
};

const projectRadarFocus = {
  "AcadX (student_portal)": { "AI / ML": 40, "Frontend": 95, "Backend": 70, "Databases": 80, "DevOps": 60, "Systems": 50 },
  "AssignmentAI": { "AI / ML": 95, "Frontend": 85, "Backend": 80, "Databases": 40, "DevOps": 60, "Systems": 70 },
  "IoT Dashboard": { "AI / ML": 30, "Frontend": 80, "Backend": 90, "Databases": 70, "DevOps": 60, "Systems": 85 },
  "ZeroGPTi": { "AI / ML": 90, "Frontend": 70, "Backend": 60, "Databases": 30, "DevOps": 40, "Systems": 65 },
  "RoadGuard AI": { "AI / ML": 95, "Frontend": 40, "Backend": 75, "Databases": 50, "DevOps": 60, "Systems": 90 },
  "Image Compressor": { "AI / ML": 20, "Frontend": 70, "Backend": 90, "Databases": 40, "DevOps": 70, "Systems": 80 },
  "IITGN.AI": { "AI / ML": 95, "Frontend": 20, "Backend": 50, "Databases": 30, "DevOps": 40, "Systems": 85 }
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

function RadarChart({ activeProject }) {
  const [hoveredAxis, setHoveredAxis] = useState(null);

  const cx = 200;
  const cy = 200;
  const r = 130;
  const axesCount = radarAxes.length;

  const getCoordinates = (values) => {
    return radarAxes.map((axis, i) => {
      const angle = (i * 2 * Math.PI) / axesCount - Math.PI / 2;
      const val = values[axis.key] || 0;
      const x = cx + r * (val / 100) * Math.cos(angle);
      const y = cy + r * (val / 100) * Math.sin(angle);
      return { x, y, name: axis.name, val };
    });
  };

  const coreCoords = getCoordinates(coreSkillsFocus);
  const corePointsStr = coreCoords.map(p => `${p.x},${p.y}`).join(' ');

  let projectCoords = null;
  let projectPointsStr = '';
  if (activeProject && projectRadarFocus[activeProject]) {
    projectCoords = getCoordinates(projectRadarFocus[activeProject]);
    projectPointsStr = projectCoords.map(p => `${p.x},${p.y}`).join(' ');
  }

  const gridLevels = [25, 50, 75, 100];

  const axisSkillsList = {
    "AI / ML": ["YOLOv8 Edge Models", "PyTorch Deep Learning", "Hugging Face Models", "Computer Vision (OpenCV)", "Model Quantization"],
    "Frontend": ["React & Hooks & Context", "Next.js App Router", "HTML5 / CSS3 Grid & Flex", "Framer Motion Animations"],
    "Backend": ["Node.js / Express", "Django Robust APIs", "Flask Microservices", "High-Performance Systems"],
    "Databases": ["MongoDB Document Store", "Firebase Realtime DB & Auth", "SQLite Relational Core", "PostgreSQL Enterprise SQL"],
    "DevOps": ["Docker Containerization", "Google Cloud Platform", "GitHub Version Control", "Vercel Cloud Deployments"],
    "Systems": ["C++ Edge Implementations", "TypeScript Typing Systems", "Python (AI/ML & Scripts)", "Data Structures & Algorithms"]
  };

  return (
    <div className="radar-chart-wrapper">
      <svg className="radar-svg" viewBox="0 0 400 400">
        {gridLevels.map((level, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r * (level / 100)}
            className="radar-grid-circle"
          />
        ))}
        {gridLevels.map((level, i) => {
          const angle = -Math.PI / 2;
          const x = cx + r * (level / 100) * Math.cos(angle);
          const y = cy + r * (level / 100) * Math.sin(angle);
          return (
            <text
              key={`label-${i}`}
              x={x + 8}
              y={y + 4}
              fill="var(--text-secondary)"
              fontSize="9px"
              fontFamily="monospace"
            >
              {level}%
            </text>
          );
        })}

        {radarAxes.map((axis, i) => {
          const angle = (i * 2 * Math.PI) / axesCount - Math.PI / 2;
          const xLine = cx + r * Math.cos(angle);
          const yLine = cy + r * Math.sin(angle);
          const xLabel = cx + (r + 25) * Math.cos(angle);
          const yLabel = cy + (r + 12) * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={xLine}
                y2={yLine}
                className="radar-grid-line"
              />
              <text
                x={xLabel}
                y={yLabel}
                className="radar-axis-label"
              >
                {axis.name}
              </text>
            </g>
          );
        })}

        <polygon
          points={corePointsStr}
          className={projectCoords ? "radar-polygon-filled" : "radar-polygon-highlight"}
        />

        {projectCoords && (
          <polygon
            points={projectPointsStr}
            className="radar-polygon-highlight"
            style={{ stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)' }}
          />
        )}

        {coreCoords.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4.5}
            className="radar-data-point"
            onMouseEnter={() => setHoveredAxis(p.name)}
            onMouseLeave={() => setHoveredAxis(null)}
          />
        ))}
      </svg>

      <div style={{ marginTop: '1rem', minHeight: '75px', width: '100%', textAlign: 'left', padding: '0 0.5rem' }}>
        {hoveredAxis ? (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-color)' }}>
              {hoveredAxis} Proficiency: {coreSkillsFocus[hoveredAxis]}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {axisSkillsList[hoveredAxis].join(' • ')}
            </div>
          </div>
        ) : activeProject ? (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#f59e0b' }}>
              {activeProject} Focus Area
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Showing target tech stack weights relative to your core proficiencies.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Hover over any axis point to view specific core skills.
          </div>
        )}
      </div>

      <div className="radar-legend">
        {activeProject && (
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
            <span>Project Focus</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TechStackConfigurator({ activeProject, setActiveProject }) {
  return (
    <div className="tech-configurator-card">
      <h3 className="configurator-title">Architect Configurator</h3>
      <p className="configurator-desc">
        Click a repository to map its engineering dependencies and highlight specific skill integrations on the Radar Chart.
      </p>
      <div className="configurator-projects-list">
        {projects.filter(project => project.title !== "IITGN.AI").map((project, idx) => (
          <div
            key={idx}
            className={`configurator-project-item ${activeProject === project.title ? 'active' : ''}`}
            onClick={() => setActiveProject(activeProject === project.title ? null : project.title)}
          >
            <div>
              <div className="configurator-project-name">{project.title}</div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {project.stack.slice(0, 3).map((s, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{s}</span>
                ))}
                {project.stack.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>+{project.stack.length - 3} more</span>}
              </div>
            </div>
            <div className="configurator-project-tag">
              {project.title.includes('AcadX') || project.title.includes('AssignmentAI') || project.title.includes('RoadGuard') ? 'AI/Web' : 'System'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const aiMockAnswers = [
  {
    keywords: ["iit", "gandhinagar", "iitgn", "study", "university"],
    response: "Ayush Singh is pursuing his B.Tech in Artificial Intelligence at IIT Gandhinagar, having entered in 2025. His research focuses on high-performance deep learning workflows, edge computing optimizations, computer vision (deploying models like YOLOv8 for road defects), and integrating conversational AI models into responsive web spaces like AcadX."
  },
  {
    keywords: ["project", "portfolio", "code", "repos"],
    response: "This portfolio highlights several key engineering achievements: 1. AcadX (a sleek student planner with Gemini AI), 2. AssignmentAI (a PDF study companion using OCR and vision models), 3. RoadGuard AI (an Edge CV road defects tracker), 4. IoT Telemetry Dashboard, and 5. ZeroGPTi (a machine-text grammar and pattern checker)."
  },
  {
    keywords: ["contact", "email", "social", "mail"],
    response: "You can reach Ayush Singh via email at ayushspna4040@gmail.com, find his repositories on GitHub at github.com/destopianpirate, or connect professionally on LinkedIn at linkedin.com/in/ayushxphoenix."
  },
  {
    keywords: ["skills", "language", "stack", "python"],
    response: "Primary capabilities cover: Programming Languages (Python, Javascript, TypeScript, C++), Frontend (React, Next.js, Framer Motion), Backend (Node.js/Express, Django, Flask), Databases (MongoDB, PostgreSQL, Firebase, SQLite), DevOps (Docker, GCP, Vercel), and Edge AI (YOLOv8, OpenCV, Model Quantization)."
  }
];

const defaultAiResponse = "Inference complete. Synthesizing neural connections... The B.Tech AI program at IIT Gandhinagar bridges mathematical foundations, deep learning frameworks, and systems engineering. Combining PyTorch neural engines with responsive client interfaces creates high-fidelity tools that operate efficiently in resource-constrained environments.";

function AISandbox() {
  const [model, setModel] = useState('Gemini 2.5 Flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);
  const [speed, setSpeed] = useState(60);
  const [prompt, setPrompt] = useState('');
  const [outputText, setOutputText] = useState('System ready. Enter prompt and click Generate to start simulation.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [vram, setVram] = useState(2.8);
  const [latency, setLatency] = useState(0);
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const [attentionGrid, setAttentionGrid] = useState(Array(64).fill(0.1));

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setOutputText('');
    setLatency(0);
    setTokensPerSec(0);

    const query = prompt.toLowerCase();
    let responseText = defaultAiResponse;
    for (const item of aiMockAnswers) {
      if (item.keywords.some(k => query.includes(k))) {
        responseText = item.response;
        break;
      }
    }

    const isPro = model.includes('Pro');
    const baseLatency = isPro ? 320 : 120;
    const modelVram = isPro ? 8.4 : 3.8;
    const finalTokensPerSec = Math.round((speed * (1.1 - (temperature * 0.15))) * (isPro ? 0.6 : 1));

    setVram(modelVram);

    let latencyTimer = 0;
    const latencyInterval = setInterval(() => {
      latencyTimer += 20;
      setLatency(latencyTimer);
      if (latencyTimer >= baseLatency) {
        clearInterval(latencyInterval);
        
        const tokens = responseText.split(' ');
        let tokenIdx = 0;
        setTokensPerSec(finalTokensPerSec);

        const typingDelay = 1000 / finalTokensPerSec;

        const streamTokens = () => {
          if (tokenIdx < tokens.length) {
            setOutputText(prev => prev + (tokenIdx === 0 ? '' : ' ') + tokens[tokenIdx]);
            setAttentionGrid(Array(64).fill(0).map(() => Math.random() * 0.8 + 0.2));
            setVram(prev => Math.min(16.0, Math.max(1.0, +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2))));

            tokenIdx++;
            setTimeout(streamTokens, typingDelay);
          } else {
            setIsGenerating(false);
            setAttentionGrid(Array(64).fill(0).map(() => Math.random() * 0.15 + 0.05));
          }
        };

        streamTokens();
      }
    }, 20);
  };

  const handleReset = () => {
    setPrompt('');
    setOutputText('System reset. Enter prompt and click Generate.');
    setIsGenerating(false);
    setVram(model.includes('Pro') ? 8.4 : 3.8);
    setLatency(0);
    setTokensPerSec(0);
    setAttentionGrid(Array(64).fill(0.1));
  };

  return (
    <div className="ai-sandbox-grid">
      <div className="ai-control-panel">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Model Configuration</h3>
        
        <div className="control-group">
          <label className="control-label">Target Model Engine</label>
          <select 
            className="sandbox-select" 
            value={model} 
            onChange={(e) => {
              setModel(e.target.value);
              setVram(e.target.value.includes('Pro') ? 8.4 : 3.8);
            }}
            disabled={isGenerating}
          >
            <option>Gemini 2.5 Flash (Edge Optimization)</option>
            <option>Gemini 2.5 Pro (High-Capacity)</option>
            <option>YOLOv8-Edge-Inference (CV)</option>
            <option>Custom study_portal CNN (Mock)</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Temperature: <span>{temperature}</span></label>
          <input 
            type="range" 
            min="0.1" 
            max="1.5" 
            step="0.1"
            value={temperature} 
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Max Output Tokens: <span>{maxTokens}</span></label>
          <input 
            type="range" 
            min="64" 
            max="1024" 
            step="64"
            value={maxTokens} 
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Generation Speed: <span>{speed} tok/s</span></label>
          <input 
            type="range" 
            min="10" 
            max="120" 
            step="5"
            value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">User Prompt</label>
          <textarea 
            placeholder="Ask about IITGN, my projects, my skills, or write a custom prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="sandbox-input-area"
            disabled={isGenerating}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            className="sandbox-button" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{ flexGrow: 1 }}
          >
            Generate
          </button>
          <button 
            className="sandbox-button" 
            onClick={handleReset}
            disabled={isGenerating}
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-color)', border: '1px solid var(--border-color)', width: '50px', padding: 0 }}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="ai-output-container">
        <div className="terminal-monitor">
          <div className="monitor-header">
            <div className="monitor-dots">
              <span className="monitor-dot red"></span>
              <span className="monitor-dot yellow"></span>
              <span className="monitor-dot green"></span>
            </div>
            <div className="monitor-title">{model} Inference Stream</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div className="monitor-body">
            {outputText}
            {isGenerating && <span style={{ display: 'inline-block', width: '8px', height: '15px', background: '#38bdf8', marginLeft: '4px', animation: 'pulse 1s infinite' }}></span>}
          </div>
        </div>

        <div className="attention-matrix-card">
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Inference Telemetry & Attention Head Weights</h4>
          
          <div className="stats-grid-mini" style={{ marginBottom: '1rem' }}>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">Latency</div>
              <div className="stat-box-mini-val">{latency} ms</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">Gen Rate</div>
              <div className="stat-box-mini-val active-glow">{tokensPerSec} t/s</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">VRAM</div>
              <div className="stat-box-mini-val">{vram} GB</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">GPU Load</div>
              <div className="stat-box-mini-val" style={{ color: isGenerating ? '#ef4444' : 'var(--text-color)' }}>{isGenerating ? '98%' : '4%'}</div>
            </div>
          </div>

          <div className="attention-grid">
            {attentionGrid.map((val, idx) => (
              <div 
                key={idx} 
                className="attention-cell" 
                style={{ opacity: val }}
                title={`Head weight: ${val.toFixed(3)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IoTSimulator() {
  const [nodes, setNodes] = useState({
    "Node_01_Edge_YOLO": true,
    "Node_02_Gateway": true,
    "Node_03_MQTT_Broker": true
  });
  const [load, setLoad] = useState(45);
  const [dataPoints, setDataPoints] = useState(Array(25).fill(40));
  const [logs, setLogs] = useState([
    "[MQTT] [system] Listening on broker port 1883...",
    "[MQTT] [system] Connection established to dashboard server.",
    "[MQTT] [Node_02_Gateway] PUB: {\"cpu_temp\": 42.5, \"status\": \"ACTIVE\"}"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      let baseVal = 30 + (load * 0.4);
      let noise = (Math.random() * 14 - 7);
      
      let nodeCount = Object.values(nodes).filter(Boolean).length;
      if (nodeCount === 0) {
        baseVal = 0;
        noise = 0;
      } else {
        baseVal = baseVal * (nodeCount / 3);
      }

      const nextVal = Math.min(100, Math.max(0, Math.round(baseVal + noise)));

      setDataPoints(prev => {
        const nextList = [...prev.slice(1), nextVal];
        return nextList;
      });

      if (nodeCount > 0) {
        const timestamp = new Date().toLocaleTimeString();
        const activeNodeKeys = Object.keys(nodes).filter(k => nodes[k]);
        const randomNode = activeNodeKeys[Math.floor(Math.random() * activeNodeKeys.length)];
        
        let newLog = '';
        if (nextVal > 80) {
          newLog = `[${timestamp}] [ALERT] [${randomNode}] High threshold breached: ${nextVal}%!`;
        } else {
          newLog = `[${timestamp}] [MQTT] [${randomNode}] PUB: {"value": ${nextVal}, "load": ${load}, "status": "OK"}`;
        }

        setLogs(prev => [...prev.slice(-15), newLog]);
      } else {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-15), `[${timestamp}] [system] [WARN] All edge telemetry nodes inactive.`]);
      }

    }, 450);

    return () => clearInterval(interval);
  }, [nodes, load]);

  const toggleNode = (nodeKey) => {
    setNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const svgWidth = 500;
  const svgHeight = 180;
  const pointsCount = dataPoints.length;
  
  const pointsStr = dataPoints.map((val, i) => {
    const x = (i * (svgWidth / (pointsCount - 1)));
    const y = svgHeight - (val * (svgHeight / 100));
    return `${x},${y}`;
  }).join(' ');

  const thresholdY = svgHeight - (80 * (svgHeight / 100));
  const isHighAlert = dataPoints[dataPoints.length - 1] > 80;

  return (
    <div className="iot-sandbox-grid">
      <div className="iot-graph-card">
        <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Telemetry Stream (Live)</h3>
          <span style={{ fontSize: '0.85rem', color: isHighAlert ? '#ef4444' : '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className={`status-dot-pulse ${isHighAlert ? 'inactive' : ''}`} style={{ backgroundColor: isHighAlert ? '#ef4444' : '#10b981' }}></span>
            {isHighAlert ? 'OVERLOAD WARNING' : 'SYSTEM HEALTHY'}
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <svg className="iot-telemetry-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {[25, 50, 75].map((lvl) => {
              const y = svgHeight - (lvl * (svgHeight / 100));
              return (
                <line 
                  key={lvl} 
                  x1={0} 
                  y1={y} 
                  x2={svgWidth} 
                  y2={y} 
                  className="telemetry-grid-line"
                />
              );
            })}
            
            <line 
              x1={0} 
              y1={thresholdY} 
              x2={svgWidth} 
              y2={thresholdY} 
              className="telemetry-threshold-line"
            />
            <text x={10} y={thresholdY - 5} fill="#ef4444" fontSize="8px" fontFamily="monospace">WARN LIMIT (80%)</text>

            <polyline
              fill="none"
              stroke={isHighAlert ? '#ef4444' : 'var(--accent-color)'}
              strokeWidth="2.5"
              points={pointsStr}
              className="telemetry-line"
              style={{ filter: isHighAlert ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))' : '' }}
            />
          </svg>
        </div>

        {isHighAlert && (
          <div className="system-warning-banner">
            <AlertTriangle size={16} /> Edge node thermal limits exceeded. Regulate CPU load immediately!
          </div>
        )}

        <div className="stats-grid-mini">
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Active Nodes</div>
            <div className="stat-box-mini-val">{Object.values(nodes).filter(Boolean).length} / 3</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Latency (MQTT)</div>
            <div className="stat-box-mini-val">~12 ms</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Current Reading</div>
            <div className="stat-box-mini-val" style={{ color: isHighAlert ? '#ef4444' : 'var(--accent-color)' }}>{dataPoints[dataPoints.length - 1]}%</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Frequency</div>
            <div className="stat-box-mini-val">2.2 Hz</div>
          </div>
        </div>
      </div>

      <div className="iot-controls-panel">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Dashboard Controls</h3>
        
        <div className="control-group">
          <label className="control-label">Regulator Load: <span>{load}% Clock</span></label>
          <input 
            type="range" 
            min="10" 
            max="100"
            value={load} 
            onChange={(e) => setLoad(parseInt(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <div className="control-group">
          <label className="control-label" style={{ marginBottom: '0.25rem' }}>Edge IoT Nodes</label>
          <div className="node-toggles-grid">
            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_01_Edge_YOLO ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-01 (YOLOv8 Core)</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={nodes.Node_01_Edge_YOLO}
                  onChange={() => toggleNode('Node_01_Edge_YOLO')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_02_Gateway ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-02 (RF Gateway)</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={nodes.Node_02_Gateway}
                  onChange={() => toggleNode('Node_02_Gateway')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_03_MQTT_Broker ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-03 (MQTT Broker)</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={nodes.Node_03_MQTT_Broker}
                  onChange={() => toggleNode('Node_03_MQTT_Broker')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="terminal-monitor" style={{ minHeight: '130px', maxHeight: '160px' }}>
          <div className="monitor-header" style={{ padding: '0.4rem 0.8rem' }}>
            <div className="monitor-title" style={{ fontSize: '0.65rem' }}>MQTT Pipeline Broker Stream</div>
          </div>
          <div className="monitor-body iot-log" style={{ padding: '0.6rem 0.8rem', fontSize: '0.75rem', maxHeight: '120px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontFamily: 'monospace', marginBottom: '0.2rem', color: log.includes('ALERT') ? '#ef4444' : log.includes('WARN') ? '#f59e0b' : '#10b981' }}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalCLI({ isOpen, onClose, theme, toggleTheme }) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { type: 'welcome', text: "destopianpirate console [Version 1.0.0]\n(c) 2026 Ayush Singh. Type 'help' for commands, Press ` (backtick) or click Close to dismiss." }
  ]);
  const [matrixActive, setMatrixActive] = useState(false);
  const canvasRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!matrixActive || !canvasRef.current || !isOpen) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const columns = Math.floor(canvas.width / 14) + 1;
    const yPos = Array(columns).fill(0);

    let animationId;
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.font = '12px monospace';

      for (let i = 0; i < yPos.length; i++) {
        const char = String.fromCharCode(Math.floor(Math.random() * 96) + 33);
        const x = i * 14;
        const y = yPos[i];
        
        ctx.fillText(char, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPos[i] = 0;
        } else {
          yPos[i] += 14;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [matrixActive, isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmdText = inputVal.trim();
    setInputVal('');
    if (!cmdText) return;

    const args = cmdText.split(' ');
    const command = args[0].toLowerCase();

    const newHistory = [...history, { type: 'input', text: `destopianpirate@iitgn:~$ ${cmdText}` }];

    switch (command) {
      case 'help':
        newHistory.push({
          type: 'output',
          text: `Available commands:
  help      - Show this documentation
  about     - Display personal biography summary
  projects  - List featured engineering repositories
  skills    - List core skill categories and proficiencies
  theme     - Switch UI theme (e.g. 'theme light', 'theme dark')
  matrix    - Toggle falling code Matrix digital rain overlay
  neofetch  - Display system specifications and ASCII logo
  clear     - Reset the terminal output logs`
        });
        break;
      
      case 'clear':
        setHistory([]);
        return;

      case 'about':
        newHistory.push({
          type: 'output',
          text: `Biography:
Ayush Singh enters academic study at IIT Gandhinagar (Class of 2025) pursuing B.Tech in Artificial Intelligence.
Engaged in bridging low-latency deep learning models (YOLOv8, Custom CNNs) with highly responsive, responsive web applications.
Currently looking for research initiatives in CV edge pipelines and scalable AI portals.`
        });
        break;

      case 'projects':
        newHistory.push({
          type: 'output',
          text: `Featured Repositories:
  1. AcadX (student_portal) - React, Vite, Framer Motion, AI Study Companion
  2. AssignmentAI - OCR Vision solver, Client PDF export, AI tutor chat
  3. IoT Dashboard - WebSockets/MQTT, sensor telemetry, active alerts
  4. RoadGuard AI - YOLOv8, GPS coordinate mapper, Google Maps API
  5. ZeroGPTi - NLP sentence grading scales, AI content highlighter
  6. Image Compressor - Flask media optimization pipeline`
        });
        break;

      case 'skills':
        newHistory.push({
          type: 'output',
          text: `Core Skill Sets:
  • Programming Languages    - Python, JavaScript, TypeScript, C++
  • Frontend Development     - React, Next.js, HTML5/CSS3, Framer Motion
  • Backend & Systems        - Node.js, Django, Flask, Express
  • Databases & Cloud        - MongoDB, PostgreSQL, SQLite, Firebase, Docker, GCP`
        });
        break;

      case 'theme':
        const targetTheme = args[1] ? args[1].toLowerCase() : null;
        if (targetTheme === 'light' || targetTheme === 'dark') {
          if (targetTheme !== theme) {
            toggleTheme();
          }
          newHistory.push({ type: 'output', text: `System theme adjusted to: ${targetTheme} mode` });
        } else {
          newHistory.push({ type: 'output', text: `Usage: theme [light | dark]. Current theme is: ${theme}` });
        }
        break;

      case 'matrix':
        setMatrixActive(prev => !prev);
        newHistory.push({ type: 'output', text: `Matrix code rain overlay: ${!matrixActive ? 'ENABLED' : 'DISABLED'}` });
        break;

      case 'neofetch':
        newHistory.push({
          type: 'neofetch',
          text: ''
        });
        break;

      default:
        newHistory.push({
          type: 'output',
          text: `bash: command not found: ${command}. Type 'help' for valid command lists.`
        });
    }

    setHistory(newHistory);
  };

  if (!isOpen) return null;

  return (
    <div className={`cli-terminal-drawer ${isOpen ? 'open' : ''}`}>
      <div className="cli-header">
        <div className="cli-title-wrapper">
          <Terminal size={14} />
          <span>destopianpirate@iitgn:~</span>
        </div>
        <button className="cli-close-btn" onClick={onClose} title="Close Console">
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
        </button>
      </div>

      <div className="cli-body" ref={bodyRef}>
        {matrixActive && <canvas ref={canvasRef} className="cli-matrix-canvas" />}
        
        <div className="cli-contents">
          {history.map((line, idx) => {
            if (line.type === 'welcome') {
              return <div key={idx} className="cli-line cli-welcome">{line.text}</div>;
            }
            if (line.type === 'input') {
              return <div key={idx} className="cli-line cli-prompt-line">{line.text}</div>;
            }
            if (line.type === 'neofetch') {
              return (
                <div key={idx} className="cli-neofetch-grid">
                  <div className="cli-ascii">
{`   _
  ( )
   H
  / \\
 |---|
 |   |
 |   |
  \\_/`}
                  </div>
                  <div className="neofetch-info">
                    <div><span className="neofetch-field">ayush@destopianpirate</span></div>
                    <div>---------------------</div>
                    <div><span className="neofetch-field">OS: </span><span>destopianOS v1.0.0</span></div>
                    <div><span className="neofetch-field">Host: </span><span>IITGN AI Studio Sandbox</span></div>
                    <div><span className="neofetch-field">Kernel: </span><span>React 19.2 + Vite</span></div>
                    <div><span className="neofetch-field">Uptime: </span><span>13m (running dev server)</span></div>
                    <div><span className="neofetch-field">Shell: </span><span>destopian-cli-shell</span></div>
                    <div><span className="neofetch-field">Theme: </span><span>{theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}</span></div>
                    <div><span className="neofetch-field">CPU: </span><span>Edge YOLOv8 Engine</span></div>
                  </div>
                </div>
              );
            }
            return <div key={idx} className="cli-line cli-output-text">{line.text}</div>;
          })}

          <div className="cli-prompt-line">
            <span>destopianpirate@iitgn:~$</span>
            <input
              ref={inputRef}
              type="text"
              className="cli-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleCommand}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [theme, setTheme] = useState('dark');
  const [selectedProject, setSelectedProject] = useState(null);
  const [sandboxTab, setSandboxTab] = useState('ai');
  const [terminalOpen, setTerminalOpen] = useState(false);

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
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div>
      {/* Premium Navigation Header */}
      <div className="header-wrapper">
        <header className="container header">
          <div className="header-brand">
            <img src={profilePic} alt="Ayush Singh" className="header-avatar" />
            <div className="header-title">
              Ayush Singh <span>at IITGN</span>
            </div>
          </div>
          
          <div className="header-right">
            <nav className="nav-tabs">
              {['about', 'projects', 'skills', 'stats'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'about' && 'About'}
                  {tab === 'projects' && 'Projects'}
                  {tab === 'skills' && 'Skills'}
                  {tab === 'stats' && 'GitHub'}
                </button>
              ))}
            </nav>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
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
                <div className="about-content">
                  <h1 style={{ fontWeight: 800 }}>Hi there, I'm <br /><span>Ayush Singh!</span></h1>
                  
                  {/* Profile Image - Mobile Only (rendered just after H1) */}
                  <div className="profile-card-container mobile-only-profile">
                    <div className="profile-image-frame">
                      <img src={profilePic} alt="Ayush Singh Profile" className="profile-large-image" />
                    </div>
                  </div>

                  <div className="about-subtitle">
                    Pursuing B.Tech in Artificial Intelligence at IIT Gandhinagar (Entered 2025)
                  </div>

                  <p className="about-bio">
                    I design and engineer intelligent applications at the intersection of Artificial Intelligence and Full-Stack Web Development. I focus on translating complex neural networks into beautiful, responsive, and production-ready interfaces, bridging the gap between machine learning models and user-friendly software architectures.
                  </p>
                  <p className="about-bio-highlight">
                    Let's build something intelligent. Exploring ways to merge deep learning software with scalable systems and modern frontend aesthetics.
                  </p>
                  <div className="about-socials">
                    <a href="mailto:ayushspna4040@gmail.com" className="footer-social-link">
                      <Mail size={16} /> Email Me
                    </a>
                    <a href="https://github.com/destopianpirate" target="_blank" rel="noreferrer" className="footer-social-link">
                      <Github size={16} /> GitHub
                    </a>
                    <a href="https://linkedin.com/in/ayushxphoenix" target="_blank" rel="noreferrer" className="footer-social-link">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                  </div>
                </div>

                {/* Profile Image - Desktop Only */}
                <div className="profile-card-container desktop-only-profile">
                  <div className="profile-image-frame">
                    <img src={profilePic} alt="Ayush Singh Profile" className="profile-large-image" />
                  </div>
                </div>
              </div>

              {/* Academic Timeline */}
              <div className="about-timeline-section" style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
                <h2 className="timeline-section-title">Academic Journey</h2>
                <div className="timeline-container">
                  {timelineData.map((item, idx) => (
                    <div className="timeline-item" key={idx}>
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Pillars Grid */}
              <div className="about-pillars-grid">
                {bioPillars.map((pillar, idx) => (
                  <div className="pillar-card" key={idx}>
                    <div className="pillar-card-header">
                      <span className="pillar-icon-wrapper">{pillar.icon}</span>
                      <span className="pillar-tag">{pillar.tag}</span>
                    </div>
                    <h3 className="pillar-title">{pillar.title}</h3>
                    <p className="pillar-desc">{pillar.desc}</p>
                  </div>
                ))}
              </div>
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
                    <div className="project-header">
                      <div className="project-logo-container">
                        {project.logo}
                      </div>
                      <div className="project-badges-wrapper">
                        {(project.title.includes('AcadX') || project.title.includes('Image Compressor')) && (
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
                          {project.liveUrl && (
                            <a 
                              href={project.liveUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="project-link-btn"
                              title="Visit Live App"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
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
                              style={{ width: 18, height: 18, filter: theme === 'dark' && techLogos[tech].includes('000000') ? 'invert(1)' : 'none' }} 
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
                <TechStackConfigurator activeProject={selectedProject} setActiveProject={setSelectedProject} />
              </div>

              <div className="skills-tab-layout">
                {skillsData.map((category, i) => (
                  <div className="skills-card" key={i}>
                    <h3 className="skills-category-title">
                      <span className="skill-icon-placeholder">{category.icon}</span>
                      {category.category}
                    </h3>
                    <div className="skills-list-wrapper">
                      {category.items.map((item, idx) => (
                        <div className="skill-row" key={idx}>
                          <div className="skill-info">
                            {item.logoUrl ? (
                              <img src={item.logoUrl} alt={item.name} style={{ width: 24, height: 24, filter: theme === 'dark' && !item.logoUrl.includes('000000') ? 'none' : theme === 'dark' ? 'invert(1)' : 'none' }} />
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

      {/* Global Footer */}
      <footer>
        <div className="container">
          <p className="footer-credits">
            &copy; {new Date().getFullYear()} Ayush Singh.
          </p>
        </div>
      </footer>

      {/* CLI Terminal Floating Trigger */}
      <button 
        className="cli-floating-btn" 
        onClick={() => setTerminalOpen(prev => !prev)}
        title="Toggle CLI Console (HotKey: `)"
      >
        <Terminal size={22} />
      </button>

      {/* CLI Drawer Console */}
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
