import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

const BounceCards = ({
  projects,
  onViewAll,
  animationDelay = 0.5,
  animationStagger = 0.08,
  easeType = 'elastic.out(1, 0.8)',
  enableHover = true,
  desktopTransforms = [
    'rotate(4deg) translate(-170px)',
    'rotate(1deg) translate(-80px)',
    'rotate(-3deg)',
    'rotate(3deg) translate(80px)',
    'rotate(-4deg) translate(170px)'
  ],
  mobileTransforms = [
    'rotate(5deg) translate(-90px)',
    'rotate(-3deg)',
    'rotate(-5deg) translate(90px)'
  ]
}) => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardCount = isMobile ? 3 : 5;
  const transforms = isMobile ? mobileTransforms : desktopTransforms;
  const visibleProjects = projects.slice(0, cardCount);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [visibleProjects.length, animationStagger, easeType, animationDelay]);

  // Remove rotation from a transform string (straighten the hovered card)
  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  // Push a sibling card's translate by offsetX
  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none'
        ? `translate(${offsetX}px)`
        : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  // On hover: straighten hovered card, push siblings outward
  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    visibleProjects.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);

      const baseTransform = transforms[i] || 'none';

      if (i === hoveredIdx) {
        // Straighten the hovered card (remove rotation)
        const noRotation = getNoRotationTransform(baseTransform);
        gsap.to(target, {
          transform: noRotation,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      } else {
        // Push siblings away from the hovered card
        const pushAmount = isMobile ? 100 : 160;
        const offsetX = i < hoveredIdx ? -pushAmount : pushAmount;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);
        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(target, {
          transform: pushedTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });
      }
    });
  };

  // On mouse leave: return all cards to their original positions
  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    visibleProjects.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transforms[i] || 'none';
      gsap.to(target, {
        transform: baseTransform,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div className="bounce-cards-section">
      <h2 className="bounce-cards-heading">Featured Projects</h2>
      <p className="bounce-cards-subtitle">
        A curated list of deep learning models, edge systems, and full-stack web platforms. Click any card to explore.
      </p>

      <div
        className={`bounce-cards-container ${isMobile ? 'mobile' : 'desktop'}`}
        ref={containerRef}
      >
        {visibleProjects.map((project, i) => (
          <div
            key={`${project.title}-${i}`}
            className={`bounce-card bounce-card-${i}`}
            style={{ transform: transforms[i] || 'none' }}
            onClick={onViewAll}
            onMouseEnter={() => pushSiblings(i)}
            onMouseLeave={resetSiblings}
          >
            <div className="bounce-card-logo">
              {project.logo}
            </div>
            <h3 className="bounce-card-title">{project.title}</h3>
            <p className="bounce-card-desc">{project.desc}</p>
            <div className="bounce-card-stack">
              {project.stack.slice(0, 3).map((tech, j) => (
                <span key={j} className="bounce-card-tech">{tech}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bounce-cards-cta">
        <button className="view-all-projects-btn" onClick={onViewAll}>
          View All Projects
        </button>
      </div>
    </div>
  );
};

export default BounceCards;
