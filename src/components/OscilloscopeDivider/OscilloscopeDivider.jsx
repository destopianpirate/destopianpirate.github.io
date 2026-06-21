import { useRef, useEffect } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import './OscilloscopeDivider.css';

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

export default function OscilloscopeDivider({ theme, isMobile, skillsData }) {
  const containerRef = useRef(null);
  const pathRef1 = useRef(null);
  const pathRef2 = useRef(null);
  const skillRefs = useRef([]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const amplitude = useTransform(scrollYProgress, [0, 1], [12, 38]);
  const frequency = useTransform(scrollYProgress, [0, 1], [2.5, 6]);

  const amplitudeRef = useRef(amplitude);
  const frequencyRef = useRef(frequency);
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    amplitudeRef.current = amplitude;
    frequencyRef.current = frequency;
    isMobileRef.current = isMobile;
  }); // runs on every render to sync refs

  const skills = [];
  const skillIcons = {};

  skillsData.forEach(category => {
    category.items.forEach(item => {
      if (item.logoUrl) {
        skills.push(item.name);
        skillIcons[item.name] = item.logoUrl;
      }
    });
  });

  const skillsRef = useRef(skills);
  const skillIconsRef = useRef(skillIcons);

  useEffect(() => {
    skillsRef.current = skills;
    skillIconsRef.current = skillIcons;
  }); // runs on every render to sync refs

  useEffect(() => {
    let animationId;
    let time = 0;

    const updateWave = () => {
      time += 0.035;
      const amp = amplitudeRef.current.get();
      const freq = frequencyRef.current.get();
      
      const width = 1200;
      const height = 100;
      const midY = height / 2;

      let d1 = `M 0 ${midY}`;
      let d2 = `M 0 ${midY}`;

      for (let x = 0; x <= width; x += 10) {
        const angle = (x / width) * Math.PI * freq - time;
        const y1 = midY + Math.sin(angle) * amp;
        const y2 = midY + Math.sin(angle + Math.PI * 0.5) * (amp * 0.65);
        
        d1 += ` L ${x} ${y1}`;
        d2 += ` L ${x} ${y2}`;
      }

      if (pathRef1.current) pathRef1.current.setAttribute('d', d1);
      if (pathRef2.current) pathRef2.current.setAttribute('d', d2);

      // Animate flowing skill elements from left to right
      const currentSkills = skillsRef.current;
      const spacingPct = 14; 
      const totalWidthPct = currentSkills.length * spacingPct;
      // Responsive speed (slower on laptop/desktop screen sizes)
      const speedFactor = isMobileRef.current ? 3.2 : 1.2;
      const flowOffsetPct = (time * speedFactor) % totalWidthPct;

      currentSkills.forEach((skill, i) => {
        const el = skillRefs.current[i];
        if (!el) return;

        const basePosPct = i * spacingPct;
        let posPct = (basePosPct + flowOffsetPct) % totalWidthPct;
        if (posPct < 0) posPct += totalWidthPct;

        let displayPct = posPct;
        if (displayPct >= totalWidthPct - 15) {
          displayPct -= totalWidthPct;
        }

        const isVisible = displayPct >= -15 && displayPct <= 115;

        if (isVisible) {
          const wavePct = Math.max(0, Math.min(100, displayPct));
          const x = (wavePct / 100) * width;
          const angle = (x / width) * Math.PI * freq - time;
          const y = midY + Math.sin(angle) * amp;

          const scaleY = 70 / 100;
          const pixelY = (y - midY) * scaleY;

          el.style.left = `${displayPct}%`;
          el.style.transform = `translate(-50%, -50%) translateY(${pixelY}px)`;
          if (el.style.opacity !== '0.85') el.style.opacity = '0.85';
          if (el.style.visibility !== 'visible') el.style.visibility = 'visible';
        } else {
          if (el.style.opacity !== '0') {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
          }
        }
      });

      animationId = requestAnimationFrame(updateWave);
    };

    animationId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div ref={containerRef} className="oscilloscope-divider">
      <svg viewBox="0 0 1200 100" width="100%" height="70" fill="none" preserveAspectRatio="none">
        <path ref={pathRef1} stroke="var(--border-hover)" strokeWidth="1.5" opacity="0.45" />
        <path ref={pathRef2} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
      </svg>
      {skills.map((skill, idx) => {
        const iconUrl = skillIcons[skill];
        const isInverted = theme === 'dark' && isDarkLogo(iconUrl);
        return (
          <span
            key={skill}
            ref={el => skillRefs.current[idx] = el}
            className="oscilloscope-floating-icon-card"
            title={skill}
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              visibility: 'hidden',
              opacity: 0
            }}
          >
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt={skill} 
                style={{ 
                  filter: isInverted ? 'invert(1)' : 'none' 
                }} 
              />
            ) : (
              skill
            )}
          </span>
        );
      })}
    </div>
  );
}
