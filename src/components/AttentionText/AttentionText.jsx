import { useState, useEffect, useRef } from 'react';
import './AttentionText.css';

export default function AttentionText({ children }) {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const cols = 12;
    const rows = 4;
    const points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          id: `${r}-${c}`,
          rx: (c / (cols - 1)) * 100,
          ry: (r / (rows - 1)) * 100,
        });
      }
    }
    setDots(points);
  }, []);

  const frameRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    });
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`attention-text-wrapper ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {hovered && (
        <div className="attention-matrix-overlay">
          <svg className="attention-svg" width="100%" height="100%">
            {dots.map(dot => {
              const dx = dot.rx - mousePos.x;
              const dy = dot.ry - mousePos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const weight = Math.exp(-(dist * dist) / 400); // Gaussian weight
              
              if (weight < 0.05) return null;

              return (
                <g key={dot.id}>
                  <line
                    x1={`${mousePos.x}%`}
                    y1={`${mousePos.y}%`}
                    x2={`${dot.rx}%`}
                    y2={`${dot.ry}%`}
                    stroke="var(--text-secondary)"
                    strokeWidth={weight * 1.2}
                    opacity={weight * 0.15}
                  />
                  <circle
                    cx={`${dot.rx}%`}
                    cy={`${dot.ry}%`}
                    r={1.5 + weight * 1.5}
                    fill="var(--text-secondary)"
                    opacity={weight * 0.35}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <div className="attention-content">
        {children}
      </div>
    </div>
  );
}
