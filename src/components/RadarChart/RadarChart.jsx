import { useState } from 'react';
import './RadarChart.css';

const projectRadarFocus = {
  "AcadX (student_portal)": { "AI / ML": 40, "Frontend": 95, "Backend": 70, "Databases": 80, "DevOps": 60, "Systems": 50 },
  "AssignmentAI": { "AI / ML": 95, "Frontend": 85, "Backend": 80, "Databases": 40, "DevOps": 60, "Systems": 70 },
  "IoT Dashboard": { "AI / ML": 30, "Frontend": 80, "Backend": 90, "Databases": 70, "DevOps": 60, "Systems": 85 },
  "ZeroGPTi": { "AI / ML": 90, "Frontend": 70, "Backend": 60, "Databases": 30, "DevOps": 40, "Systems": 65 },
  "RoadGuard AI": { "AI / ML": 95, "Frontend": 40, "Backend": 75, "Databases": 50, "DevOps": 60, "Systems": 90 },
  "ImagePress - Image Compressor": { "AI / ML": 20, "Frontend": 70, "Backend": 90, "Databases": 40, "DevOps": 70, "Systems": 80 },
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

export function RadarChart({ activeProject }) {
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
    "Databases": ["MongoDB Document Store", "Firebase Realtime DB & Auth"],
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

export function TechStackConfigurator({ activeProject, setActiveProject, projects }) {
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
