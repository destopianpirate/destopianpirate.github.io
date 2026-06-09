import React from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Code } from 'lucide-react'
import profilePic from './assets/profile.png'

const projects = [
  {
    title: "AcadX (student_portal)",
    stack: ["React", "Vite", "Framer Motion", "Custom CSS"],
    desc: "A sleek, glassmorphic academic planner and student workspace to manage university life.",
    features: ["Synced timetables", "Holidays registry", "Course conflict detection", "GPA/attendance trackers", "Integrated Gemini AI study companion"]
  },
  {
    title: "AssignmentAI",
    stack: ["React", "Gemini AI", "Python", "Vite"],
    desc: "A powerful AI-driven educational tool that solves assignments from PDF, Word, and Notebook files.",
    features: ["Vision-capable solving", "Client-side PDF export", "Detailed step-by-step math solutions", "Interactive AI tutor chat"]
  },
  {
    title: "IoT Dashboard",
    stack: ["React", "Vite", "Tailwind CSS", "WebSockets/MQTT", "Chart.js"],
    desc: "A modern, interactive web dashboard to monitor and manage IoT sensor networks and connected devices in real-time.",
    features: ["Real-time data streams and telemetry visualization", "Interactive widgets (dials, live graphs, controls)", "Alerts management", "Device health tracking"]
  },
  {
    title: "ZeroGPTi",
    stack: ["React", "Vite"],
    desc: "An advanced AI content analysis tool designed to detect and analyze machine-generated text. (In Development)",
    features: []
  },
  {
    title: "RoadGuard",
    stack: ["YOLOv8", "Raspberry Pi 4", "Python", "Google Maps API", "GPS"],
    desc: "An AI-powered real-time pothole detection and smart road monitoring system built for Edge AI deployment.",
    features: ["Real-time pothole detection using YOLOv8", "GPS-based location tagging", "Auto-marking potholes on Google Maps", "Buzzer alert system for drivers", "Designed for IoT + Hardware integration"]
  },
  {
    title: "Image Compressor",
    stack: ["Python", "Flask", "Pillow", "HTML/CSS"],
    desc: "A lightweight, web-based image compression utility.",
    features: ["Compresses images while maintaining quality", "Supports JPG/PNG/WEBP conversion"]
  },
  {
    title: "IITGN.AI",
    stack: ["Python", "Jupyter Notebooks"],
    desc: "My academic repository for AI and Machine Learning research at IIT Gandhinagar.",
    features: ["Machine Learning assignments", "NewEra.ai research projects", "Semester coursework"]
  }
];

const skills = [
  { category: "Programming Languages", items: ["JavaScript", "TypeScript", "Python", "C++"] },
  { category: "Frontend", items: ["React", "Next.js", "HTML5", "CSS3"] },
  { category: "Backend", items: ["Node.js", "Django", "Flask"] },
  { category: "Database", items: ["MongoDB", "SQLite"] },
  { category: "DevOps & Cloud", items: ["Docker", "Google Cloud"] },
  { category: "Tools", items: ["Git", "VS Code", "Figma", "Vite"] }
];

function App() {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <div className="tagline">B.Tech @ IIT Gandhinagar | Artificial Intelligence</div>
          <h1>Hi there, I'm <span className="text-highlight">Ayush Singh!</span></h1>
          <p style={{ fontSize: '1.2rem', color: '#cccccc', maxWidth: '600px' }}>
            I design and engineer intelligent applications at the intersection of AI, Edge Computing, and Full-Stack Web Development. With a foundation from IIT Gandhinagar, my work focuses on translating complex neural networks and sensor telemetry into beautiful, responsive, and production-ready digital interfaces.
          </p>
          <p style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 'bold', marginTop: '1rem' }}>
            Let's build something intelligent.
          </p>
        </div>
        <img src={profilePic} alt="Ayush Singh" className="hero-image" />
      </motion.section>

      {/* Projects Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVars}
      >
        <h2>Featured Repositories</h2>
        <div className="projects-grid">
          {projects.map((project, i) => (
            <motion.div className="project-card" key={i} variants={itemVars}>
              <div className="project-title">
                <h3>{project.title}</h3>
                <Code size={18} color="#666" />
              </div>
              <div className="stack-tags">
                {project.stack.map(tech => (
                  <span className="tag" key={tech}>{tech}</span>
                ))}
              </div>
              <p>{project.desc}</p>
              {project.features.length > 0 && (
                <div className="project-features">
                  <strong>Key Features:</strong>
                  <ul>
                    {project.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVars}
      >
        <h2>Languages & Tools</h2>
        <div className="skills-grid">
          {skills.map((skillGroup, i) => (
            <motion.div className="skill-category" key={i} variants={itemVars}>
              <h3>{skillGroup.category}</h3>
              <ul className="skill-list">
                {skillGroup.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* GitHub Stats */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVars}
      >
        <h2>GitHub Stats & Trophies</h2>
        <div className="stats-container">
          <img src="https://github-profile-trophy.vercel.app/?username=destopianpirate&theme=transparent&title_color=ffffff&text_color=cccccc&v=1" alt="Trophies" />
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
             <img src="https://github-readme-streak-stats.herokuapp.com/?user=destopianpirate&theme=transparent&hide_border=true&title_color=ffffff&text_color=cccccc&sideNums=ffffff&sideLabels=aaaaaa&ring=ffffff&fire=ffffff&currStreakNum=ffffff&v=1" alt="Streak Stats" />
             <img src="https://github-readme-activity-graph.vercel.app/graph?username=destopianpirate&theme=transparent&color=ffffff&line=ffffff&point=ffffff&hide_border=true&v=1" alt="Activity Graph" />
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer>
        <div className="social-links">
          <a href="mailto:ayushspna4040@gmail.com" className="social-link" target="_blank" rel="noreferrer">
            <Mail size={20} /> Email
          </a>
          <a href="https://github.com/destopianpirate" className="social-link" target="_blank" rel="noreferrer">
            <Github size={20} /> GitHub
          </a>
          <a href="https://linkedin.com/in/ayushxphoenix" className="social-link" target="_blank" rel="noreferrer">
            <Linkedin size={20} /> LinkedIn
          </a>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          &copy; {new Date().getFullYear()} Ayush Singh. Built with React & Vite.
        </p>
      </footer>
    </div>
  )
}

export default App
