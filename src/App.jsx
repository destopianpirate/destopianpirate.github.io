import React, { useState, useEffect } from 'react'
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
  Trophy, 
  Terminal,
  Layers,
  GraduationCap,
  Sun,
  Moon
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
    title: "RoadGuard",
    stack: ["YOLOv8", "Raspberry Pi 4", "Python", "Google Maps API", "GPS"],
    desc: "An Edge AI traffic safety appliance deploying real-time object detection models to locate and report infrastructure defects.",
    features: [
      "Hardware-optimized YOLOv8 pothole detection running locally on Edge", 
      "Precise GPS coordinate mapping for road anomalies", 
      "Automatic backend logging to mark locations on Google Maps API", 
      "Physical driver hazard alarm buzzer integration"
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
      { name: "WebSockets & MQTT", level: "80%", logoUrl: "https://cdn.simpleicons.org/mqtt/660066" }
    ]
  },
  {
    category: "Databases & Storage",
    icon: <Database />,
    items: [
      { name: "MongoDB (NoSQL Document)", level: "86%", logoUrl: "https://cdn.simpleicons.org/mongodb/47A248" },
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
      { name: "Git & GitHub Pipelines", level: "92%", logoUrl: "https://cdn.simpleicons.org/git/F05032" },
      { name: "Vercel Hostings", level: "90%", logoUrl: "https://cdn.simpleicons.org/vercel/000000" }
    ]
  },
  {
    category: "Hardware & Edge ML",
    icon: <Cpu />,
    items: [
      { name: "Raspberry Pi Integration", level: "85%", logoUrl: "https://cdn.simpleicons.org/raspberrypi/A22846" },
      { name: "YOLOv8 Edge Implementations", level: "88%", logoUrl: null },
      { name: "Custom PCB Design", level: "70%", logoUrl: null },
      { name: "Serial Device Logs", level: "80%", logoUrl: null }
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
    title: "Edge Computing",
    desc: "Integrating sensor telemetry and YOLOv8 models onto Raspberry Pi platforms.",
    icon: <Activity size={24} />,
    tag: "Hardware"
  },
  {
    title: "Full-Stack Web",
    desc: "Engineering premium, glassmorphic interfaces and scalable backend services.",
    icon: <Layers size={24} />,
    tag: "Web App"
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
                  <h1>Hi there, I'm <br /><span>Ayush Singh!</span></h1>
                  
                  <div className="academic-badge">
                    <div className="academic-badge-logo">
                      <GraduationCap size={22} />
                    </div>
                    <div className="academic-badge-info">
                      <span className="academic-badge-uni">IIT Gandhinagar</span>
                      <span className="academic-badge-course">B.Tech in Artificial Intelligence</span>
                      <span className="academic-badge-meta">Class of 2029 • Entered 2025</span>
                    </div>
                  </div>

                  <p className="about-bio">
                    I design and engineer intelligent applications at the intersection of Artificial Intelligence, Edge Computing, and Full-Stack Web Development, focusing on translating complex neural networks and sensor telemetry into beautiful, responsive, and production-ready digital interfaces.
                  </p>
                  <p className="about-bio-highlight">
                    Let's build something intelligent. Exploring ways to merge deep learning software with low-latency physical systems and glassmorphic frontend aesthetics.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
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

                <div className="profile-card-container">
                  <div className="profile-image-frame">
                    <img src={profilePic} alt="Ayush Singh Profile" className="profile-large-image" />
                  </div>
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
                  <div className={`project-card ${project.title.includes('AcadX') || project.title.includes('Image Compressor') ? 'featured-col-2' : ''}`} key={i}>
                    <div className="project-header">
                      <div className="project-logo-container">
                        {project.logo}
                      </div>
                      <div className="project-badges-wrapper">
                        {project.liveUrl && (
                          <span className="project-status-badge">
                            <span className="live-pulse"></span>
                            Live App
                          </span>
                        )}
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
                        <span className="tech-pill" key={tech}>{tech}</span>
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
                Real-time contribution statistics, system streaks, activity metrics, and gamified achievement trophies tracking my work.
              </p>

              <div className="stats-dashboard">
                <div className="stat-widget">
                  <div className="widget-title">
                    <Trophy size={18} /> Profile Trophies
                  </div>
                  <div className="stat-image-container">
                    <img 
                      src={`https://github-profile-trophy.vercel.app/?username=destopianpirate&theme=${theme === 'dark' ? 'transparent' : 'light'}&title_color=${theme === 'dark' ? 'ffffff' : '111111'}&text_color=${theme === 'dark' ? 'cccccc' : '333333'}&v=2`} 
                      alt="GitHub Profile Trophies" 
                    />
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
    </div>
  )
}

export default App
